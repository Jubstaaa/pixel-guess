// Game images live in the `pixelguess` DigitalOcean Space rather than in this
// repo: there are ~1900 of them and bundling them cost the mobile app 26MB of
// binary and the web app a 26MB build output. Published app binaries hardcode
// whatever this points at, so it has to stay stable — old store versions keep
// requesting it long after a newer release ships.
export const IMAGE_CDN_BASE_URL =
    'https://pixelguess.fra1.cdn.digitaloceanspaces.com'

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
