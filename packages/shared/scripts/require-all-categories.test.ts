import { describe, expect, test } from 'bun:test'

import { requireAllCategories } from './require-all-categories'
import type { CategoryResult } from './sources/category'

function category(slug: string): CategoryResult {
    return {
        meta: {
            slug,
            name: slug,
            exportName: `${slug}Characters`,
            imageType: 'poster',
            iconUrl: `https://example.com/${slug}.png`,
        },
        characters: [{ name: 'A', remoteUrl: 'https://example.com/a.png' }],
    }
}

describe('requireAllCategories', () => {
    test('returns every result when all categories were fetched', () => {
        const movies = category('movies')
        const flags = category('flags')

        expect(
            requireAllCategories([
                { label: 'Movies', result: movies },
                { label: 'Flags', result: flags },
            ])
        ).toEqual([movies, flags])
    })

    test('throws naming the failed categories when any category failed', () => {
        expect(() =>
            requireAllCategories([
                { label: 'Movies', result: category('movies') },
                { label: 'Naruto', result: null },
                { label: 'Football', result: null },
            ])
        ).toThrow('2 of 3 categories failed (Naruto, Football)')
    })

    test('treats a category that came back empty as failed', () => {
        const empty = { ...category('naruto'), characters: [] }

        expect(() =>
            requireAllCategories([
                { label: 'Movies', result: category('movies') },
                { label: 'Naruto', result: empty },
            ])
        ).toThrow('1 of 2 categories failed (Naruto: no characters)')
    })

    test('throws when every category failed', () => {
        expect(() =>
            requireAllCategories([{ label: 'Movies', result: null }])
        ).toThrow('1 of 1 categories failed (Movies)')
    })
})
