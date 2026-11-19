import { afterEach, describe, expect, spyOn, test } from 'bun:test'

import { MAX_COUNT } from '../constants'
import type { Character, GameState } from '../types'
import {
    advanceToNextCharacter,
    createInitialState,
    getNextState,
    getRandomCharacter,
    getSkipState,
} from './game-engine'

const characters: Character[] = ['A', 'B', 'C'].map((name) => ({
    name,
    imageUrl: `test/${name}.webp`,
}))

const state = (overrides: Partial<GameState> = {}): GameState => ({
    currentCharacter: characters[0]!,
    count: 0,
    seenIndices: [0],
    ...overrides,
})

afterEach(() => {
    spyOn(Math, 'random').mockRestore()
})

describe('getRandomCharacter', () => {
    test('only picks characters that have not been seen', () => {
        for (let i = 0; i < 50; i++) {
            expect(getRandomCharacter(characters, [0, 2])?.index).toBe(1)
        }
    })

    test('returns null once every character has been seen', () => {
        expect(getRandomCharacter(characters, [0, 1, 2])).toBeNull()
    })

    test('returns null for an empty category', () => {
        expect(getRandomCharacter([], [])).toBeNull()
    })
})

describe('getNextState', () => {
    test('a correct guess resets the attempt count', () => {
        expect(getNextState(state({ count: 3 }), true).count).toBe(0)
    })

    test('a wrong guess uses up one attempt', () => {
        expect(getNextState(state({ count: 3 }), false).count).toBe(4)
    })

    test('attempts never exceed MAX_COUNT', () => {
        expect(getNextState(state({ count: MAX_COUNT }), false).count).toBe(
            MAX_COUNT
        )
    })

    test('keeps the current character and history', () => {
        const before = state({ seenIndices: [0, 2] })
        const after = getNextState(before, false)
        expect(after.currentCharacter).toBe(before.currentCharacter)
        expect(after.seenIndices).toEqual([0, 2])
    })
})

describe('getSkipState', () => {
    test('resets the attempt count', () => {
        expect(getSkipState(state({ count: 5 })).count).toBe(0)
    })
})

describe('createInitialState', () => {
    test('starts on a random character with no attempts used', () => {
        spyOn(Math, 'random').mockReturnValue(0.5)
        expect(createInitialState(characters)).toEqual({
            currentCharacter: characters[1]!,
            count: 0,
            seenIndices: [1],
        })
    })

    test('has no character for an empty category', () => {
        expect(createInitialState([])).toEqual({
            currentCharacter: null,
            count: 0,
            seenIndices: [],
        })
    })
})

describe('advanceToNextCharacter', () => {
    test('moves to an unseen character and remembers it', () => {
        const next = advanceToNextCharacter(
            characters,
            state({ seenIndices: [0, 2] })
        )
        expect(next.currentCharacter).toBe(characters[1]!)
        expect(next.seenIndices).toEqual([0, 2, 1])
    })

    test('starts a new cycle once every character has been seen', () => {
        spyOn(Math, 'random').mockReturnValue(0)
        const next = advanceToNextCharacter(
            characters,
            state({ seenIndices: [0, 1, 2] })
        )
        expect(next.currentCharacter).toBe(characters[0]!)
        expect(next.seenIndices).toEqual([0])
    })

    test('keeps the attempt count it was given', () => {
        expect(
            advanceToNextCharacter(characters, state({ count: 0 })).count
        ).toBe(0)
    })
})
