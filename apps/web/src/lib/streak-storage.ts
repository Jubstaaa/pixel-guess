import type { Difficulty } from '@pixel-guess/shared'

const key = (slug: string, difficulty: Difficulty) =>
    `streak:${slug}:${difficulty}`

export const loadStreak = (
    slug: string,
    difficulty: Difficulty
): { streak: number; maxStreak: number } => {
    try {
        const raw = localStorage.getItem(key(slug, difficulty))
        if (!raw) return { streak: 0, maxStreak: 0 }
        return JSON.parse(raw)
    } catch {
        return { streak: 0, maxStreak: 0 }
    }
}

export const saveStreak = (
    slug: string,
    difficulty: Difficulty,
    streak: number,
    maxStreak: number
): void => {
    try {
        localStorage.setItem(
            key(slug, difficulty),
            JSON.stringify({ streak, maxStreak })
        )
    } catch {
        // ignore
    }
}
