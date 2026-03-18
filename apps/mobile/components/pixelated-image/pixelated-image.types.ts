import type { ImageType } from '@pixel-guess/shared'

export interface PixelatedImageProps {
    count: number
    imageUrl: string
    levelType: number
    imageType?: ImageType
    size?: number
}
