export const MAX_COUNT = 6

export const LEVEL_TYPE = {
    EASY: 0,
    HARD: 1,
} as const

export const DIFFICULTY_CONFIG = {
    easy: { maxBlockSize: 80, grayscale: false },
    hard: { maxBlockSize: 24, grayscale: true },
} as const
