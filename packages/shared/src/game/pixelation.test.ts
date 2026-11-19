import { describe, expect, test } from 'bun:test'

import { IMAGE_TYPE_BLOCK_SIZE, MAX_COUNT } from './config'
import { computeBlockSize } from './pixelation'

describe('computeBlockSize', () => {
    test('starts at the largest block for the image type and difficulty', () => {
        expect(computeBlockSize(0, 'easy', 400, 'character')).toBe(
            IMAGE_TYPE_BLOCK_SIZE.character.easy
        )
        expect(computeBlockSize(0, 'hard', 400, 'poster')).toBe(
            IMAGE_TYPE_BLOCK_SIZE.poster.hard
        )
    })

    test('reaches single pixels on the last attempt', () => {
        expect(computeBlockSize(MAX_COUNT, 'easy', 400, 'character')).toBe(1)
    })

    test('gets sharper with every wrong guess', () => {
        const sizes = Array.from({ length: MAX_COUNT + 1 }, (_, count) =>
            computeBlockSize(count, 'easy', 400, 'logo')
        )
        for (let i = 1; i < sizes.length; i++) {
            expect(sizes[i]!).toBeLessThan(sizes[i - 1]!)
        }
    })

    test('scales the block with the rendered size', () => {
        expect(computeBlockSize(0, 'easy', 200, 'character')).toBe(
            IMAGE_TYPE_BLOCK_SIZE.character.easy / 2
        )
    })

    test('never returns less than one pixel', () => {
        expect(computeBlockSize(MAX_COUNT, 'hard', 10, 'poster')).toBe(1)
    })
})
