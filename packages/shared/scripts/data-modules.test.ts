import { describe, expect, test } from 'bun:test'

import {
    renderCategoriesModule,
    renderCharactersByCategoryModule,
} from './data-modules'

const movies = {
    characterCount: 3,
    meta: {
        exportName: 'movieCharacters',
        imageType: 'poster' as const,
        name: 'Movies',
        slug: 'movies',
    },
}
const tvShows = {
    characterCount: 2,
    meta: {
        exportName: 'tvShowCharacters',
        imageType: 'poster' as const,
        name: 'TV Shows',
        slug: 'tv-shows',
    },
}

describe('renderCategoriesModule', () => {
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
