import type { Character } from '../types'

const normalize = (str: string): string =>
    String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')

// Exact beats prefix beats substring; within a tier, the more of the name the
// query covers, the higher it ranks, so "san" lists Sanji before Sanji Vinsmoke.
const matchScore = (name: string, search: string): number => {
    if (name === search) return 1
    const coverage = search.length / Math.max(name.length, 1)
    if (name.startsWith(search)) return 0.5 + coverage / 2
    if (name.includes(search)) return coverage / 2
    return 0
}

export const filterCharacters = (
    characters: Character[],
    query: string,
    excludeIndices: number[] = [],
    limit = 5
): { character: Character; index: number }[] => {
    const available = characters
        .map((c, i) => ({ character: c, index: i }))
        .filter(({ index }) => !excludeIndices.includes(index))

    const search = normalize(query)
    if (!search) return available.slice(0, limit)

    return available
        .map((item) => ({
            ...item,
            score: matchScore(normalize(item.character.name), search),
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ character, index }) => ({ character, index }))
}

export const checkGuess = (guess: string, answer: string): boolean =>
    normalize(guess) === normalize(answer)
