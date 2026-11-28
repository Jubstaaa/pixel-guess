import { render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'

import { PixelatedCanvas } from './pixelated-canvas'

beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

test.each([
    ['poster', 'aspect-[2/3]'],
    ['character', 'aspect-square'],
    ['logo', 'aspect-square'],
] as const)(
    'reserves a fixed %s frame before the image loads',
    (imageType, aspect) => {
        const { container } = render(
            <PixelatedCanvas
                count={0}
                difficulty="easy"
                imageType={imageType}
                imageUrl="movies/x.webp"
            />
        )
        expect(container.firstElementChild?.classList).toContain(aspect)
        expect(container.querySelector('canvas')?.classList).toContain(
            'object-contain'
        )
    }
)

test('offers a retry when the image fails to load', async () => {
    class FailingImage {
        crossOrigin = ''
        onerror: (() => void) | null = null
        onload: (() => void) | null = null
        set src(_url: string) {
            queueMicrotask(() => this.onerror?.())
        }
    }
    vi.stubGlobal('Image', FailingImage)

    render(
        <PixelatedCanvas count={0} difficulty="easy" imageUrl="movies/x.webp" />
    )

    expect(await screen.findByRole('button', { name: /retry/i })).toBeTruthy()
})
