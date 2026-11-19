import { cleanup } from '@testing-library/react'
import {
    resetIntersectionMocking,
    setupIntersectionMocking,
} from 'react-intersection-observer/test-utils'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no IntersectionObserver, which the ad slots use to lazy-load.
beforeEach(() => {
    setupIntersectionMocking(vi.fn)
})

afterEach(() => {
    cleanup()
    resetIntersectionMocking()
})
