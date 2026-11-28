import { describe, expect, test } from 'bun:test'

import type { CategoryResult } from './sources/category'

import { CATEGORY_ORDER, orderCategories } from './category-order'

function category(slug: string): CategoryResult {
    return {
        characters: [],
        meta: {
            exportName: `${slug}Characters`,
            iconUrl: `https://example.com/${slug}.png`,
            imageType: 'poster',
            name: slug,
            slug,
        },
    }
}

describe('orderCategories', () => {
    test('returns the results in display order', () => {
        const shuffled = [...CATEGORY_ORDER].reverse().map(category)

        expect(orderCategories(shuffled).map(r => r.meta.slug)).toEqual(
            CATEGORY_ORDER
        )
    })

    test('throws when a fetched category has no display position', () => {
        const results = [...CATEGORY_ORDER, 'new-source'].map(category)

        expect(() => orderCategories(results)).toThrow(
            'not in CATEGORY_ORDER: new-source'
        )
    })

    test('throws when a listed category was not fetched', () => {
        const results = CATEGORY_ORDER.filter(s => s !== 'flags').map(category)

        expect(() => orderCategories(results)).toThrow(
            'missing from results: flags'
        )
    })
})
