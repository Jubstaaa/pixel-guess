import { IMAGE_CDN_BASE_URL } from '../constants'

// `key` is the relative path stored on every Character/Category — e.g.
// 'dota-2/abaddon.webp'. It doubles as the object key in the Space, so the data
// files did not have to change when the images moved off disk.
export const getImageUrl = (key: string) => `${IMAGE_CDN_BASE_URL}/${key}`
