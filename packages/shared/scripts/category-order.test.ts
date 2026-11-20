import { describe, expect, test } from 'bun:test'

import { CATEGORY_ORDER, orderCategories } from './category-order'
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
        characters: [],
    }
}

describe('orderCategories', () => {
    test('returns the results in display order', () => {
        const shuffled = [...CATEGORY_ORDER].reverse().map(category)

        expect(orderCategories(shuffled).map((r) => r.meta.slug)).toEqual(
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
        const results = CATEGORY_ORDER.filter((s) => s !== 'flags').map(
            category
        )

        expect(() => orderCategories(results)).toThrow(
            'missing from results: flags'
        )
    })
})
