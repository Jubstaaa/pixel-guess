import { cleanup } from '@testing-library/react'
import { cleanup as cleanupMedia, matchMedia } from 'mock-match-media'
import {
    resetIntersectionMocking,
    setupIntersectionMocking,
} from 'react-intersection-observer/test-utils'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no IntersectionObserver, which the ad slots use to lazy-load,
// and no matchMedia, which picks the ad placements for the screen size.
beforeEach(() => {
    setupIntersectionMocking(vi.fn)
    vi.stubGlobal('matchMedia', matchMedia)
})

afterEach(() => {
    cleanup()
    cleanupMedia()
    resetIntersectionMocking()
})
