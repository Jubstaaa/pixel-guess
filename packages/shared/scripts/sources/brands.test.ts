import { describe, expect, test } from 'bun:test'

import { fetchBrands } from './brands'

describe('fetchBrands', () => {
    test('keeps the logo.dev URLs the shipped images were downloaded from', async () => {
        const { characters, meta } = await fetchBrands()

        expect(characters.find((c) => c.name === 'Apple')?.remoteUrl).toBe(
            'https://img.logo.dev/apple.com?token=pk_eQWznTEVSQWtTwGzi_p5Qg&format=png&theme=dark'
        )
        expect(meta.iconUrl).toBe(
            'https://img.logo.dev/google.com?token=pk_eQWznTEVSQWtTwGzi_p5Qg&format=png'
        )
    })
})
