import { API_BASE_URL } from '@/constants/api'

export const addImageResizeParams = (
    imageUrl: string | undefined,
    width: number,
    height: number
): string => {
    if (!imageUrl) return ''
    try {
        const base = imageUrl.startsWith('/')
            ? API_BASE_URL.replace(/\/$/, '')
            : ''
        const url = new URL(base + imageUrl)
        url.searchParams.set('width', width.toString())
        url.searchParams.set('height', height.toString())
        url.searchParams.set('quality', '75')
        url.searchParams.set('resize', 'contain')
        return url.toString()
    } catch {
        return imageUrl
    }
}
