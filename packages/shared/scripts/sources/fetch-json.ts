import pRetry, { AbortError, type Options } from 'p-retry'
import { z } from 'zod'

const SECRET_PARAMS = ['api_key']
const DEFAULT_RETRY = { minTimeout: 2000, retries: 3 }

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
            onFailedAttempt: ({ attemptNumber, error }) => {
                console.warn(
                    `  ↻ attempt ${attemptNumber} failed: ${error.message}`
                )
            },
        }
    )
}

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

export function redactUrl(url: URL): string {
    const safe = new URL(url)
    for (const param of SECRET_PARAMS) {
        if (safe.searchParams.has(param))
            safe.searchParams.set(param, 'REDACTED')
    }
    return safe.toString()
}
