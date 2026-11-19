import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { useCanvasPixelation } from './use-canvas-pixelation'

class FakeImage {
    static created: FakeImage[] = []
    crossOrigin = ''
    height = 100
    onerror: (() => void) | null = null
    onload: (() => void) | null = null
    src = ''
    width = 100
    constructor() {
        FakeImage.created.push(this)
    }
}

const drawImage = vi.fn()
const context = {
    clearRect: vi.fn(),
    drawImage,
    fillRect: vi.fn(),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: vi.fn(),
}

const renderPixelation = (imageUrl: string) => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(
        context as unknown as CanvasRenderingContext2D
    )
    const hook = renderHook(
        ({ url }) => {
            const result = useCanvasPixelation(url, 0, 'easy')
            ;(result.canvasRef as { current: HTMLCanvasElement }).current =
                canvas
            return result
        },
        { initialProps: { url: imageUrl } }
    )
    return hook
}

beforeEach(() => {
    FakeImage.created = []
    drawImage.mockClear()
    vi.stubGlobal('Image', FakeImage)
})

describe('useCanvasPixelation', () => {
    test('loads the image from the CDN in CORS mode', () => {
        renderPixelation('flags/a.webp')
        // The ref is attached after the first render, so the effect runs on
        // the rerender that follows.
        const image = FakeImage.created.at(-1)
        expect(image?.crossOrigin).toBe('anonymous')
        expect(image?.src).toBe(
            'https://pixelguess.fra1.cdn.digitaloceanspaces.com/flags/a.webp'
        )
    })

    test('reports the image as loaded once it is drawn', () => {
        const { result } = renderPixelation('flags/a.webp')
        act(() => FakeImage.created.at(-1)?.onload?.())
        expect(result.current.isImageLoaded).toBe(true)
        expect(drawImage).toHaveBeenCalled()
    })

    test('ignores an earlier image that finishes loading late', () => {
        const { rerender } = renderPixelation('flags/a.webp')
        const stale = FakeImage.created.at(-1)!
        rerender({ url: 'flags/b.webp' })
        const current = FakeImage.created.at(-1)!
        expect(current).not.toBe(stale)

        act(() => current.onload?.())
        drawImage.mockClear()
        act(() => stale.onload?.())

        expect(drawImage).not.toHaveBeenCalled()
    })
})
