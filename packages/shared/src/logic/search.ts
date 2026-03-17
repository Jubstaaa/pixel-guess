import type { Character } from '../types'

const normalize = (str: string): string =>
    String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')

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
        .map((item) => {
            const norm = normalize(item.character.name)
            let score = 0
            if (norm === search) score = 1
            else if (norm.startsWith(search))
                score = 1 - search.length / Math.max(norm.length, 1)
            else if (norm.includes(search))
                score = 0.5 - search.length / Math.max(norm.length, 1)
            return { ...item, score }
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}

export const checkGuess = (guess: string, answer: string): boolean =>
    normalize(guess) === normalize(answer)
