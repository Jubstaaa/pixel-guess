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
    character: { easy: 56, hard: 28 },
    poster: { easy: 48, hard: 22 },
    logo: { easy: 36, hard: 16 },
} as const
