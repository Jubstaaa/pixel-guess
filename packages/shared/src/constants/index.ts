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
    character: { easy: 80, hard: 24 },
    poster: { easy: 70, hard: 20 },
    logo: { easy: 50, hard: 16 },
} as const
