import { render } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'

import { PixelatedCanvas } from './pixelated-canvas'

beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

// The canvas is resized to each image's own aspect ratio once it loads; the
// frame around it must not change size with it, or the search box below jumps.
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
