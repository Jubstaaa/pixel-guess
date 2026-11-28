import {
    DeleteObjectsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import { createHash } from 'crypto'
import { readdirSync, readFileSync, statSync } from 'fs'
import PQueue from 'p-queue'
import { join, relative } from 'path'

const IMAGES_DIR = join(import.meta.dir, '../assets/images')
const REGION = 'fra1'
const BUCKET = 'pixelguess'
const ORIGIN = `${BUCKET}.${REGION}.digitaloceanspaces.com`

const CACHE_CONTROL = 'public, max-age=2592000'

const PRUNE = process.argv.includes('--prune')
const DRY_RUN = process.argv.includes('--dry-run')

const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required')
}

const s3 = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint: `https://${REGION}.digitaloceanspaces.com`,
    region: REGION,
})

interface LocalFile {
    key: string
    md5: string
    path: string
}

function collectLocalFiles(dir: string): LocalFile[] {
    const out: LocalFile[] = []

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue

        const full = join(dir, entry.name)

        if (entry.isDirectory()) {
            out.push(...collectLocalFiles(full))
            continue
        }

        out.push({
            key: relative(IMAGES_DIR, full),
            md5: createHash('md5').update(readFileSync(full)).digest('hex'),
            path: full,
        })
    }

    return out
}

async function flushCdn(paths: string[]) {
    const token = process.env.DO_API_TOKEN

    if (!token) {
        console.log(
            '\nDO_API_TOKEN not set — skipping CDN purge. Changed objects will' +
                ' keep serving the old bytes for up to the endpoint TTL. Purge with:' +
                `\n  doctl compute cdn flush <endpoint-id> --files ${paths.slice(0, 3).join(',')}`
        )
        return
    }

    const headers = {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
    }

    const listed = await fetch(
        'https://api.digitalocean.com/v2/cdn/endpoints',
        {
            headers,
        }
    )
    const { endpoints } = (await listed.json()) as {
        endpoints: { id: string; origin: string }[]
    }
    const endpoint = endpoints.find(e => e.origin === ORIGIN)

    if (!endpoint) {
        console.log(`\nNo CDN endpoint found for ${ORIGIN} — skipping purge.`)
        return
    }

    const res = await fetch(
        `https://api.digitalocean.com/v2/cdn/endpoints/${endpoint.id}/cache`,
        { body: JSON.stringify({ files: paths }), headers, method: 'DELETE' }
    )

    console.log(
        res.ok
            ? `Purged ${paths.length} path(s) from the CDN.`
            : `CDN purge failed: ${res.status} ${await res.text()}`
    )
}

async function listRemote(): Promise<Map<string, string>> {
    const remote = new Map<string, string>()
    let token: string | undefined

    do {
        const page = await s3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET,
                ContinuationToken: token,
            })
        )

        for (const obj of page.Contents ?? []) {
            if (!obj.Key) continue

            remote.set(obj.Key, (obj.ETag ?? '').replaceAll('"', ''))
        }

        token = page.NextContinuationToken
    } while (token)

    return remote
}

async function main() {
    if (!statSync(IMAGES_DIR, { throwIfNoEntry: false })?.isDirectory()) {
        throw new Error(
            `${IMAGES_DIR} does not exist. It is a gitignored working directory —` +
                ' run `bun run generate` to populate it.'
        )
    }

    const local = collectLocalFiles(IMAGES_DIR)
    console.log(`${local.length} local images`)

    const remote = await listRemote()
    console.log(`${remote.size} objects in ${BUCKET}`)

    const changed = local.filter(f => remote.get(f.key) !== f.md5)
    const orphaned = [...remote.keys()].filter(
        key => !local.some(f => f.key === key)
    )

    console.log(
        `${changed.length} to upload, ${orphaned.length} orphaned remote`
    )

    if (DRY_RUN) {
        for (const f of changed.slice(0, 20)) console.log(`  upload ${f.key}`)
        for (const k of orphaned.slice(0, 20)) console.log(`  orphan ${k}`)
        return
    }

    const queue = new PQueue({ concurrency: 16 })
    let done = 0

    await queue.addAll(
        changed.map(file => async () => {
            await s3.send(
                new PutObjectCommand({
                    ACL: 'public-read',
                    Body: readFileSync(file.path),
                    Bucket: BUCKET,
                    CacheControl: CACHE_CONTROL,
                    ContentType: 'image/webp',
                    Key: file.key,
                })
            )

            done += 1
            if (done % 100 === 0) console.log(`  ${done}/${changed.length}`)
        })
    )

    console.log(`Uploaded ${done} objects.`)

    if (orphaned.length > 0) {
        if (!PRUNE) {
            console.log(
                `\n${orphaned.length} remote object(s) have no local file. Re-run with` +
                    ' --prune to delete them. Note that already-published app versions' +
                    ' may still be requesting them.'
            )
        } else {
            for (let i = 0; i < orphaned.length; i += 1000) {
                await s3.send(
                    new DeleteObjectsCommand({
                        Bucket: BUCKET,
                        Delete: {
                            Objects: orphaned
                                .slice(i, i + 1000)
                                .map(Key => ({ Key })),
                        },
                    })
                )
            }
            console.log(`Deleted ${orphaned.length} orphaned object(s).`)
        }
    }

    if (changed.length > 0) {
        await flushCdn(changed.map(f => `/${f.key}`))
    }
}

main().catch((err: unknown) => {
    console.error(err)
    process.exit(1)
})
