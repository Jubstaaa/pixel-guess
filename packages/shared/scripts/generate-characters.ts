import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

import PQueue from 'p-queue'
import pRetry, { AbortError } from 'p-retry'
import sharp from 'sharp'

import { orderCategories } from './category-order'
import {
    type CategoryOutcome,
    requireAllCategories,
} from './require-all-categories'
import type { CategoryResult, CharacterEntry } from './sources/category'
import { fetchBrands } from './sources/brands'
import { fetchDota2 } from './sources/dota-2'
import { fetchOrNetworkError } from './sources/fetch-json'
import { fetchDragonBall } from './sources/dragon-ball'
import { fetchFlags } from './sources/flags'
import { fetchFootball } from './sources/football'
import { fetchGenshinImpact } from './sources/genshin-impact'
import { fetchHarryPotter } from './sources/harry-potter'
import { fetchJikanCategory, JIKAN_CATEGORIES } from './sources/jikan'
import { fetchLeagueOfLegends } from './sources/league-of-legends'
import { fetchNaruto } from './sources/naruto'
import { fetchOverwatch } from './sources/overwatch'
import { fetchPokemon } from './sources/pokemon'
import { fetchRickAndMorty } from './sources/rick-and-morty'
import {
    fetchAnimeSeries,
    fetchMovies,
    fetchPeople,
    fetchTvShows,
} from './sources/tmdb'
import { fetchValorant } from './sources/valorant'
import { toFileName } from './to-file-name'

const OUT_DIR = join(import.meta.dir, '../src/data/characters')
// Local working directory only — gitignored. The images this writes are published
// to the CDN by scripts/sync-images.ts; neither app reads them off disk.
const IMAGES_DIR = join(import.meta.dir, '../assets/images')
const FRESH = process.argv.includes('--fresh')

const MAX_IMAGE_SIZE = 400
const IMAGE_QUALITY = 80
// Jikan allows three requests per second; one category at a time with a pause
// keeps the eight anime categories under it.
const JIKAN_DELAY_MS = 1000

interface DownloadTask {
    url: string
    outPath: string
    localKey: string
}

async function fetchCategory(
    label: string,
    fn: () => Promise<CategoryResult>
): Promise<CategoryOutcome> {
    try {
        const result = await pRetry(fn, {
            retries: 2,
            minTimeout: 3000,
            factor: 2,
            onFailedAttempt: ({ attemptNumber, error }) =>
                console.warn(
                    `  ↻ ${label} attempt ${attemptNumber} failed: ${error.message}`
                ),
        })
        return { label, result }
    } catch (e) {
        console.error(
            `✗ ${label} failed: ${e instanceof Error ? e.message : String(e)}`
        )
        return { label, result: null }
    }
}

async function downloadBatch(tasks: DownloadTask[]): Promise<DownloadTask[]> {
    const failed: DownloadTask[] = []
    let completed = 0
    const queue = new PQueue({ concurrency: 30 })

    const jobs = tasks.map((task) =>
        queue.add(async () => {
            try {
                await pRetry(
                    async () => {
                        const res = await fetchOrNetworkError(
                            new URL(task.url),
                            task.url,
                            {
                                headers: {
                                    'User-Agent':
                                        'Mozilla/5.0 (compatible; PixelGuess/1.0)',
                                },
                            }
                        )
                        if (res.status === 429) throw new Error('rate limited')
                        if (!res.ok) throw new AbortError(`HTTP ${res.status}`)
                        const buf = Buffer.from(await res.arrayBuffer())
                        await sharp(buf)
                            .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
                                fit: 'inside',
                                withoutEnlargement: true,
                            })
                            .webp({ quality: IMAGE_QUALITY })
                            .toFile(task.outPath)
                    },
                    { retries: 3, minTimeout: 1000, factor: 2 }
                )
            } catch {
                failed.push(task)
            }
            completed++
            if (completed % 200 === 0 || completed === tasks.length) {
                process.stdout.write(`\r  ${completed}/${tasks.length}`)
            }
        })
    )

    await Promise.all(jobs)
    console.log('')
    return failed
}

const MAX_RETRY_ROUNDS = 3

async function downloadAll(tasks: DownloadTask[]): Promise<Set<string>> {
    let remaining = await downloadBatch(tasks)

    for (
        let round = 1;
        round <= MAX_RETRY_ROUNDS && remaining.length > 0;
        round++
    ) {
        console.log(
            `\n⚠ ${remaining.length} failed — retry round ${round}/${MAX_RETRY_ROUNDS}...`
        )
        remaining = await downloadBatch(remaining)
    }

    if (remaining.length > 0) {
        console.warn(
            `\n⚠ ${remaining.length} images permanently failed (will be excluded):`
        )
        for (const t of remaining) console.warn(`  - ${t.localKey} (${t.url})`)
    }

    return new Set(remaining.map((t) => t.localKey))
}

// ━━━ SERIALIZATION ━━━

const PRINT_WIDTH = 80

function serializeString(s: string): string {
    if (s.includes("'"))
        return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    return `'${s.replace(/\\/g, '\\\\')}'`
}

function serializeCharacters(
    exportName: string,
    chars: { name: string; localKey: string }[]
): string {
    const header = `// Auto-generated by scripts/generate-characters.ts — do not edit manually
import type { Character } from '../../types'

`
    const items = chars.map(({ name, localKey }) => {
        const nameStr = serializeString(name)
        const urlStr = serializeString(localKey)
        const urlLine = `        imageUrl: ${urlStr},`
        const urlFormatted =
            urlLine.length > PRINT_WIDTH
                ? `        imageUrl:\n            ${urlStr},`
                : urlLine
        return `    {\n        name: ${nameStr},\n${urlFormatted}\n    }`
    })
    const array = items.length === 0 ? '[]' : `[\n${items.join(',\n')},\n]`
    return header + `export const ${exportName}: Character[] = ${array}\n`
}

// ━━━ OUTPUT GENERATORS ━━━

function writeCategoriesFile(sorted: CategoryResult[]) {
    const imports = sorted.map((r) => `    ${r.meta.exportName},`).join('\n')

    const entries = sorted
        .map((r) => {
            const iconKey = serializeString(`categories/${r.meta.slug}.webp`)
            return `    {
        slug: '${r.meta.slug}',
        name: ${serializeString(r.meta.name)},
        icon: ${iconKey},
        characterCount: ${r.meta.exportName}.length,
        imageType: '${r.meta.imageType}',
    }`
        })
        .join(',\n')

    // Quote only the slugs that need it ('tv-shows'), matching prettier's
    // as-needed quoteProps. Quoting everything makes `bun run lint` fail on this
    // file every time it is regenerated.
    const charsByCategory = sorted
        .map((r) => {
            const key = /^[A-Za-z_$][\w$]*$/.test(r.meta.slug)
                ? r.meta.slug
                : `'${r.meta.slug}'`
            return `    ${key}: ${r.meta.exportName},`
        })
        .join('\n')

    const content = `// Auto-generated by scripts/generate-characters.ts — do not edit manually
import type { Category } from '../types'

import {
${imports}
} from './characters'

export const categories: Category[] = [
${entries},
]

export const charactersByCategory: Record<string, typeof ${sorted[0].meta.exportName}> = {
${charsByCategory}
}
`

    writeFileSync(join(import.meta.dir, '../src/data/categories.ts'), content)
    console.log('Written: src/data/categories.ts')
}

function writeCharactersIndex(results: CategoryResult[]) {
    const sorted = [...results].sort((a, b) =>
        a.meta.slug.localeCompare(b.meta.slug)
    )
    const exports = sorted
        .map((r) => `export { ${r.meta.exportName} } from './${r.meta.slug}'`)
        .join('\n')

    const content = `// Auto-generated by scripts/generate-characters.ts — do not edit manually\n${exports}\n`
    writeFileSync(join(OUT_DIR, 'index.ts'), content)
    console.log('Written: src/data/characters/index.ts')
}

// ━━━ MAIN ━━━

async function main() {
    const tmdbApiKey = process.env.TMDB_API_KEY
    if (!tmdbApiKey) throw new Error('TMDB_API_KEY env variable is required')
    const footballApiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!footballApiKey)
        throw new Error('FOOTBALL_DATA_API_KEY env variable is required')

    console.log('Fetching character data...\n')

    const parallelOutcomes = await Promise.all([
        fetchCategory('LoL', fetchLeagueOfLegends),
        fetchCategory('Dota 2', fetchDota2),
        fetchCategory('Valorant', fetchValorant),
        fetchCategory('Flags', fetchFlags),
        fetchCategory('Pokémon', fetchPokemon),
        fetchCategory('Genshin', fetchGenshinImpact),
        fetchCategory('Rick & Morty', fetchRickAndMorty),
        fetchCategory('Overwatch', fetchOverwatch),
        fetchCategory('Dragon Ball', fetchDragonBall),
        fetchCategory('Naruto', fetchNaruto),
        fetchCategory('Movies', () => fetchMovies(tmdbApiKey)),
        fetchCategory('TV Shows', () => fetchTvShows(tmdbApiKey)),
        fetchCategory('People', () => fetchPeople(tmdbApiKey)),
        fetchCategory('Brands', fetchBrands),
        fetchCategory('Football', () => fetchFootball(footballApiKey)),
        fetchCategory('Anime Series', () => fetchAnimeSeries(tmdbApiKey)),
        fetchCategory('Harry Potter', fetchHarryPotter),
    ])

    const jikanOutcomes: CategoryOutcome[] = []
    for (const category of JIKAN_CATEGORIES) {
        jikanOutcomes.push(
            await fetchCategory(category.label, () =>
                fetchJikanCategory(category)
            )
        )
        await Bun.sleep(JIKAN_DELAY_MS)
    }

    const allResults = orderCategories(
        requireAllCategories([...parallelOutcomes, ...jikanOutcomes])
    )

    console.log(`\n${allResults.length} categories fetched successfully`)

    // ━━━ PREPARE IMAGE DOWNLOADS ━━━
    console.log('\nPreparing image downloads...')

    if (FRESH && existsSync(IMAGES_DIR)) rmSync(IMAGES_DIR, { recursive: true })
    mkdirSync(IMAGES_DIR, { recursive: true })

    const downloadTasks: DownloadTask[] = []
    const characterLocalKeys = new Map<
        CategoryResult,
        Map<CharacterEntry, string>
    >()

    for (const result of allResults) {
        const dir = join(IMAGES_DIR, result.meta.slug)
        mkdirSync(dir, { recursive: true })

        const usedNames = new Map<string, number>()
        const keyMap = new Map<CharacterEntry, string>()

        for (const char of result.characters) {
            let fileName = toFileName(char.name)
            const count = usedNames.get(fileName) ?? 0
            if (count > 0) fileName = `${fileName}-${count}`
            usedNames.set(toFileName(char.name), count + 1)

            const localKey = `${result.meta.slug}/${fileName}.webp`
            keyMap.set(char, localKey)

            downloadTasks.push({
                url: char.remoteUrl,
                outPath: join(IMAGES_DIR, localKey),
                localKey,
            })
        }

        characterLocalKeys.set(result, keyMap)
    }

    // Category icons
    const categoriesDir = join(IMAGES_DIR, 'categories')
    mkdirSync(categoriesDir, { recursive: true })

    for (const result of allResults) {
        const iconKey = `categories/${result.meta.slug}.webp`
        downloadTasks.push({
            url: result.meta.iconUrl,
            outPath: join(IMAGES_DIR, iconKey),
            localKey: iconKey,
        })
    }

    // ━━━ DOWNLOAD + OPTIMIZE ━━━
    const tasksToDownload = FRESH
        ? downloadTasks
        : downloadTasks.filter((t) => !existsSync(t.outPath))
    const cached = downloadTasks.length - tasksToDownload.length
    console.log(
        `\nDownloading ${tasksToDownload.length} images${cached > 0 ? ` (${cached} cached)` : ''}...`
    )
    const failed =
        tasksToDownload.length > 0
            ? await downloadAll(tasksToDownload)
            : new Set<string>()

    // ━━━ WRITE CHARACTER DATA FILES ━━━
    console.log('\nWriting data files...')

    // Wiped only now, so an interrupted download phase leaves the previous
    // data in place instead of a categories.ts importing deleted files.
    if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true })
    mkdirSync(OUT_DIR, { recursive: true })

    for (const result of allResults) {
        const keyMap = characterLocalKeys.get(result)!
        const chars = result.characters
            .filter((c) => !failed.has(keyMap.get(c)!))
            .map((c) => ({
                name: c.name,
                localKey: keyMap.get(c)!,
            }))

        const content = serializeCharacters(result.meta.exportName, chars)
        writeFileSync(join(OUT_DIR, `${result.meta.slug}.ts`), content)
    }

    // ━━━ WRITE CHARACTERS INDEX ━━━
    writeCharactersIndex(allResults)

    // ━━━ WRITE CATEGORIES FILE ━━━
    writeCategoriesFile(allResults)

    console.log('\nDone!')
    console.log('Run `bun run sync:images` to publish the images to the CDN.')
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
