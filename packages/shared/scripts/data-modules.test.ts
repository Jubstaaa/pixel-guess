import { describe, expect, test } from 'bun:test'

import {
    renderCategoriesModule,
    renderCharactersByCategoryModule,
} from './data-modules'

const movies = {
    meta: {
        exportName: 'movieCharacters',
        imageType: 'poster' as const,
        name: 'Movies',
        slug: 'movies',
    },
    characterCount: 3,
}
const tvShows = {
    meta: {
        exportName: 'tvShowCharacters',
        imageType: 'poster' as const,
        name: 'TV Shows',
        slug: 'tv-shows',
    },
    characterCount: 2,
}

describe('renderCategoriesModule', () => {
    // The home page imports the category list; if it imported the character
    // arrays to count them, every character would ship in the entry bundle.
    test('writes the counts as literals and imports no character data', () => {
        const source = renderCategoriesModule([movies, tvShows])
        expect(source).toContain('characterCount: 3,')
        expect(source).toContain('characterCount: 2,')
        expect(source).not.toContain('./characters')
    })
})

describe('renderCharactersByCategoryModule', () => {
    test('maps each slug to its character array', () => {
        const source = renderCharactersByCategoryModule([movies, tvShows])
        expect(source).toContain("} from './characters'")
        expect(source).toContain('    movies: movieCharacters,')
        expect(source).toContain("    'tv-shows': tvShowCharacters,")
    })
})
