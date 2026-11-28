import type { Character, GameState } from '../types'

import { MAX_COUNT } from './config'

export const getRandomCharacter = (
    characters: Character[],
    seenIndices: number[]
): null | { character: Character; index: number } => {
    const available = characters
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => !seenIndices.includes(i))

    const pick = available[Math.floor(Math.random() * available.length)]
    if (!pick) return null

    return { character: pick.c, index: pick.i }
}

export const createInitialState = (characters: Character[]): GameState => {
    const pick = getRandomCharacter(characters, [])
    return {
        count: 0,
        currentCharacter: pick?.character ?? null,
        seenIndices: pick ? [pick.index] : [],
    }
}

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
