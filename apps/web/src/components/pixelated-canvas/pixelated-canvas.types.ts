import type { Difficulty, ImageType } from '@pixel-guess/shared'

export interface PixelatedCanvasProps {
    imageUrl: string | null
    count: number
    difficulty: Difficulty
    imageType?: ImageType
}
