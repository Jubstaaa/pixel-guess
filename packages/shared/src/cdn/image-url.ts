// Game images live in the `pixelguess` DigitalOcean Space rather than in this
// repo: there are ~1900 of them and bundling them cost the mobile app 26MB of
// binary and the web app a 26MB build output. Published app binaries hardcode
// whatever this points at, so it has to stay stable — old store versions keep
// requesting it long after a newer release ships.
export const IMAGE_CDN_BASE_URL =
    'https://pixelguess.fra1.cdn.digitaloceanspaces.com'

// `key` is the relative path stored on every Character/Category — e.g.
// 'dota-2/abaddon.webp'. It doubles as the object key in the Space, so the data
// files did not have to change when the images moved off disk.
export const getImageUrl = (key: string) => `${IMAGE_CDN_BASE_URL}/${key}`
