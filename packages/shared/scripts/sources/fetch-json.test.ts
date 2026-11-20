import { afterAll, describe, expect, test } from 'bun:test'
import { z } from 'zod'

import { fetchJson, redactUrl } from './fetch-json'

const hits = new Map<string, number>()

const server = Bun.serve({
    port: 0,
    fetch(req) {
        const { pathname } = new URL(req.url)
        hits.set(pathname, (hits.get(pathname) ?? 0) + 1)
        if (pathname === '/ok') return Response.json({ count: 3, extra: true })
        if (pathname === '/bad-shape') return Response.json({ count: 'three' })
        return new Response('missing', { status: 404 })
    },
})

afterAll(() => server.stop(true))

const schema = z.object({ count: z.number() })

describe('fetchJson', () => {
    test('returns the payload parsed by the schema', async () => {
        await expect(
            fetchJson(new URL('/ok', server.url), schema)
        ).resolves.toEqual({ count: 3 })
    })

    test('rejects a payload that does not match the schema, without retrying', async () => {
        await expect(
            fetchJson(new URL('/bad-shape', server.url), schema)
        ).rejects.toThrow(/Unexpected response from .*\/bad-shape/)
        expect(hits.get('/bad-shape')).toBe(1)
    })

    test('rejects a non-429 HTTP error without retrying', async () => {
        await expect(
            fetchJson(new URL('/missing', server.url), schema)
        ).rejects.toThrow(/HTTP 404/)
        expect(hits.get('/missing')).toBe(1)
    })
})

describe('redactUrl', () => {
    test('hides the TMDB api key and keeps the other parameters', () => {
        expect(
            redactUrl(
                new URL('https://api.themoviedb.org/3/x?api_key=secret&page=2')
            )
        ).toBe('https://api.themoviedb.org/3/x?api_key=REDACTED&page=2')
    })

    test('leaves URLs without credentials unchanged', () => {
        expect(redactUrl(new URL('https://pokeapi.co/api/v2/pokemon'))).toBe(
            'https://pokeapi.co/api/v2/pokemon'
        )
    })
})
