import pRetry, { AbortError } from 'p-retry'
import { z } from 'zod'

const SECRET_PARAMS = ['api_key']

// Request URLs end up in retry warnings and error messages, and TMDB only
// accepts its v3 key as a query parameter.
export function redactUrl(url: URL): string {
    const safe = new URL(url)
    for (const param of SECRET_PARAMS) {
        if (safe.searchParams.has(param))
            safe.searchParams.set(param, 'REDACTED')
    }
    return safe.toString()
}

export async function fetchJson<Schema extends z.ZodType>(
    url: URL,
    schema: Schema,
    init?: RequestInit
): Promise<z.output<Schema>> {
    const label = redactUrl(url)

    return pRetry(
        async () => {
            const res = await fetch(url, init)
            if (res.status === 429) throw new Error(`Rate limited: ${label}`)
            if (!res.ok) throw new AbortError(`HTTP ${res.status}: ${label}`)

            const parsed = schema.safeParse(await res.json())
            if (!parsed.success) {
                throw new AbortError(
                    `Unexpected response from ${label}:\n${z.prettifyError(parsed.error)}`
                )
            }
            return parsed.data
        },
        {
            retries: 3,
            minTimeout: 2000,
            factor: 2,
            onFailedAttempt: ({ attemptNumber }) =>
                console.warn(`  ↻ ${label} attempt ${attemptNumber} failed`),
        }
    )
}
