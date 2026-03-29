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
    character: { easy: 48, hard: 24 },
    poster: { easy: 24, hard: 12 },
    logo: { easy: 36, hard: 18 },
} as const
