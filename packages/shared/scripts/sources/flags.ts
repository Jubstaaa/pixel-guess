import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const EXCLUDED_CODES = new Set([
    'ac',
    'cp',
    'dg',
    'ea',
    'eu',
    'hm',
    'ic',
    'sh',
    'sj',
    'ta',
    'un',
    'xk',
    'bv',
    'aq',
    'tf',
    'gs',
    'io',
    'um',
])

const codesSchema = z.record(z.string(), z.string())

export async function fetchFlags(): Promise<CategoryResult> {
    const codes = await fetchJson(
        new URL('https://flagcdn.com/en/codes.json'),
        codesSchema
    )

    const characters = Object.entries(codes)
        .filter(([code]) => code.length === 2 && !EXCLUDED_CODES.has(code))
        .map(([code, name]) => ({
            name,
            remoteUrl: `https://flagcdn.com/w1280/${code}.webp`,
        }))
        .sort(byName)

    console.log(`Flags: ${characters.length} countries`)
    return {
        meta: {
            slug: 'flags',
            name: 'Flags',
            exportName: 'flagCharacters',
            imageType: 'logo',
            iconUrl: 'https://flagcdn.com/w160/un.png',
        },
        characters,
    }
}
