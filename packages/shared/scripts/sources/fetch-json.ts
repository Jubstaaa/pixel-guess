import pRetry, { AbortError, type Options } from 'p-retry'
import { z } from 'zod'

const SECRET_PARAMS = ['api_key']
const DEFAULT_RETRY = { retries: 3, minTimeout: 2000 }

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

// p-retry only retries a TypeError it recognises as a network error, and it
// does not recognise Bun's messages (ECONNREFUSED, ENOTFOUND), so they would
// fail on the first attempt with no URL attached.
export async function fetchOrNetworkError(
    url: URL,
    label: string,
    init?: RequestInit
): Promise<Response> {
    try {
        return await fetch(url, init)
    } catch (cause) {
        throw new Error(`Network error: ${label}`, { cause })
    }
}

export async function fetchJson<Schema extends z.ZodType>(
    url: URL,
    schema: Schema,
    init?: RequestInit,
    retry: Pick<Options, 'minTimeout' | 'retries'> = DEFAULT_RETRY
): Promise<z.output<Schema>> {
    const label = redactUrl(url)

    return pRetry(
        async () => {
            const res = await fetchOrNetworkError(url, label, init)
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
            ...retry,
            factor: 2,
            onFailedAttempt: ({ attemptNumber, error }) =>
                console.warn(
                    `  ↻ attempt ${attemptNumber} failed: ${error.message}`
                ),
        }
    )
}
