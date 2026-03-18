export const MAX_COUNT = 6

export const LEVEL_TYPE = {
    EASY: 0,
    HARD: 1,
} as const

export const DIFFICULTY_CONFIG = {
    easy: { grayscale: false },
    hard: { grayscale: true },
} as const

export const IMAGE_TYPE_BLOCK_SIZE = {
    character: { easy: 32, hard: 80 },
    poster: { easy: 28, hard: 70 },
    logo: { easy: 20, hard: 50 },
} as const
