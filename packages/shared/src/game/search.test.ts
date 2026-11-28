import { describe, expect, test } from 'bun:test'

import type { Character } from '../types'

import { checkGuess, filterCharacters } from './search'

const character = (name: string): Character => ({
    imageUrl: `test/${name}.webp`,
    name,
})

const characters = ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno'].map(
    character
)

describe('checkGuess', () => {
    test('accepts the exact answer', () => {
        expect(checkGuess('Naruto Uzumaki', 'Naruto Uzumaki')).toBe(true)
    })

    test('ignores case, spacing and punctuation', () => {
        expect(checkGuess('naruto-uzumaki!', 'Naruto Uzumaki')).toBe(true)
    })

    test('ignores diacritics', () => {
        expect(checkGuess('Aland Islands', 'Åland Islands')).toBe(true)
        expect(checkGuess('Pokemon', 'Pokémon')).toBe(true)
    })

    test('rejects a different answer', () => {
        expect(checkGuess('Sasuke Uchiha', 'Naruto Uzumaki')).toBe(false)
    })

    test('rejects a partial answer', () => {
        expect(checkGuess('Naruto', 'Naruto Uzumaki')).toBe(false)
    })
})

describe('filterCharacters', () => {
    test('returns the first characters when the query is empty', () => {
        expect(
            filterCharacters(characters, '', [], 2).map(r => r.index)
        ).toEqual([0, 1])
    })

    test('treats a query of only punctuation as empty', () => {
        expect(filterCharacters(characters, '  -!', [], 5)).toHaveLength(3)
    })

    test('keeps the original index of each match', () => {
        const [match] = filterCharacters(characters, 'sakura')
        expect(match?.index).toBe(2)
        expect(match?.character).toBe(characters[2])
    })

    test('ranks exact, then prefix, then substring matches', () => {
        const pool = ['Ash', 'Ashe', 'Flash'].map(character)
        expect(
            filterCharacters(pool, 'ash').map(r => r.character.name)
        ).toEqual(['Ash', 'Ashe', 'Flash'])
    })

    test('prefers the shorter name among prefix matches', () => {
        const pool = ['Sanji Vinsmoke', 'Sanji'].map(character)
        expect(
            filterCharacters(pool, 'san').map(r => r.character.name)
        ).toEqual(['Sanji', 'Sanji Vinsmoke'])
    })

    test('finds a character by a later part of the name', () => {
        expect(
            filterCharacters(characters, 'uchiha').map(r => r.index)
        ).toEqual([1])
    })

    test('leaves out characters already guessed', () => {
        expect(
            filterCharacters(characters, 'sa', [1]).map(r => r.index)
        ).toEqual([2])
    })

    test('caps the number of results', () => {
        const pool = Array.from({ length: 10 }, (_, i) =>
            character(`Hero ${i}`)
        )
        expect(filterCharacters(pool, 'hero', [], 3)).toHaveLength(3)
    })

    test('returns nothing when no name matches', () => {
        expect(filterCharacters(characters, 'goku')).toEqual([])
    })
})
