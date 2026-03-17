import { DIFFICULTY_CONFIG, MAX_COUNT } from '../constants'
import type { Difficulty } from '../types'

export const computeBlockSize = (
    count: number,
    difficulty: Difficulty,
    size: number = 400
): number => {
    const { maxBlockSize } = DIFFICULTY_CONFIG[difficulty]
    const minBlockSize = 1
    const blockSize = Math.max(
        minBlockSize,
        maxBlockSize -
            Math.floor((count / MAX_COUNT) * (maxBlockSize - minBlockSize))
    )
    return Math.max(1, Math.round(blockSize * (size / 400)))
}
