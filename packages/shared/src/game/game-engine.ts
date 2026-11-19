import { MAX_COUNT } from './config'
import type { Character, GameState } from '../types'

export const getRandomCharacter = (
    characters: Character[],
    seenIndices: number[]
): { character: Character; index: number } | null => {
    const available = characters
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => !seenIndices.includes(i))

    if (available.length === 0) return null

    const pick = available[Math.floor(Math.random() * available.length)]
    return { character: pick.c, index: pick.i }
}

export const createInitialState = (characters: Character[]): GameState => {
    const pick = getRandomCharacter(characters, [])
    return {
        currentCharacter: pick?.character ?? null,
        count: 0,
        seenIndices: pick ? [pick.index] : [],
    }
}

// Once every character in the category has been shown, the history is cleared
// so the category can be played again instead of running dry.
export const advanceToNextCharacter = (
    characters: Character[],
    state: GameState
): GameState => {
    const unseen = getRandomCharacter(characters, state.seenIndices)
    if (unseen) {
        return {
            ...state,
            currentCharacter: unseen.character,
            seenIndices: [...state.seenIndices, unseen.index],
        }
    }

    const restart = getRandomCharacter(characters, [])
    return {
        ...state,
        currentCharacter: restart?.character ?? null,
        seenIndices: restart ? [restart.index] : [],
    }
}

export const getNextState = (
    state: GameState,
    isCorrect: boolean
): GameState => {
    if (isCorrect) {
        return {
            ...state,
            count: 0,
        }
    }

    return {
        ...state,
        count: Math.min(MAX_COUNT, state.count + 1),
    }
}

export const getSkipState = (state: GameState): GameState => ({
    ...state,
    count: 0,
})
