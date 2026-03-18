import { IMAGE_TYPE_BLOCK_SIZE, MAX_COUNT } from '../constants'
import type { Difficulty, ImageType } from '../types'

export const computeBlockSize = (
    count: number,
    difficulty: Difficulty,
    size: number = 400,
    imageType: ImageType = 'character'
): number => {
    const maxBlockSize = IMAGE_TYPE_BLOCK_SIZE[imageType][difficulty]
    const minBlockSize = 1
    const blockSize = Math.max(
        minBlockSize,
        maxBlockSize -
            Math.floor((count / MAX_COUNT) * (maxBlockSize - minBlockSize))
    )
    return Math.max(1, Math.round(blockSize * (size / 400)))
}
