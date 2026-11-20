import { describe, expect, test } from 'bun:test'

import { categories } from './categories'
import { charactersByCategory } from './characters-by-category'

// The data files are generated; these pin the invariants both apps rely on.
describe('generated game data', () => {
    test('every category has characters and a matching count', () => {
        for (const category of categories) {
            const characters = charactersByCategory[category.slug]
            expect(characters, category.slug).toBeDefined()
            expect(characters.length, category.slug).toBeGreaterThan(0)
            expect(category.characterCount, category.slug).toBe(
                characters.length
            )
        }
    })

    test('category slugs are unique', () => {
        const slugs = categories.map((c) => c.slug)
        expect(new Set(slugs).size).toBe(slugs.length)
    })

    test('image keys are relative .webp paths', () => {
        for (const characters of Object.values(charactersByCategory)) {
            for (const { imageUrl } of characters) {
                expect(imageUrl).toMatch(/^[a-z0-9-]+\/[^/]+\.webp$/)
            }
        }
        for (const { icon } of categories) {
            expect(icon).toMatch(/^categories\/[a-z0-9-]+\.webp$/)
        }
    })
})
