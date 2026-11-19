import { expect, test } from 'bun:test'

import { getImageUrl } from './image-url'

test('builds the CDN URL from the stored key', () => {
    expect(getImageUrl('dota-2/abaddon.webp')).toBe(
        'https://pixelguess.fra1.cdn.digitaloceanspaces.com/dota-2/abaddon.webp'
    )
})
