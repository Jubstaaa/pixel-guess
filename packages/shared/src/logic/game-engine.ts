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
        count: Math.min(6, state.count + 1),
    }
}

export const getSkipState = (state: GameState): GameState => ({
    ...state,
    count: 0,
})
