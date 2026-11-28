import { cleanup } from '@testing-library/react'
import { cleanup as cleanupMedia, matchMedia } from 'mock-match-media'
import {
    resetIntersectionMocking,
    setupIntersectionMocking,
} from 'react-intersection-observer/test-utils'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
    setupIntersectionMocking(vi.fn)
    vi.stubGlobal('matchMedia', matchMedia)
})

afterEach(() => {
    cleanup()
    cleanupMedia()
    resetIntersectionMocking()
})
