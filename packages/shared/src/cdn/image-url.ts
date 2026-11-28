export const IMAGE_CDN_BASE_URL =
    'https://pixelguess.fra1.cdn.digitaloceanspaces.com'

export const getImageUrl = (key: string): string =>
    `${IMAGE_CDN_BASE_URL}/${key}`
