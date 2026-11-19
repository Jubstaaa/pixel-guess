import { act, fireEvent, render, screen } from '@testing-library/react'
import { setMedia } from 'mock-match-media'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { categories } from '@pixel-guess/shared'

import { AD_EVERY_N_CATEGORIES, HomePage } from './home'

vi.mock('../../ads/ad-placements', () => ({
    adPlacements: {
        homeListMobile: { size: 'largeMobileBanner', slot: '1111111111' },
        homeListWide: { size: 'banner', slot: '2222222222' },
    },
}))

const renderHome = () =>
    render(
        <RouterProvider
            router={createMemoryRouter([{ path: '/', element: <HomePage /> }])}
        />
    )

// The grid's direct children, in order: a category card or an ad.
const gridItems = () =>
    [
        ...screen.getByRole('heading', { name: 'Choose a Category' })
            .nextElementSibling!.children,
    ].map((item) => (item.tagName === 'ASIDE' ? 'ad' : 'category'))

describe('HomePage ads', () => {
    test('places an ad after every fourth category', () => {
        renderHome()
        const items = gridItems()

        expect(items.filter((item) => item === 'category')).toHaveLength(
            categories.length
        )
        let run = 0
        for (const item of items) {
            if (item === 'ad') {
                expect(run).toBe(AD_EVERY_N_CATEGORIES)
                run = 0
            } else {
                run++
            }
        }
    })

    test('never ends the list with an ad', () => {
        renderHome()
        expect(gridItems().at(-1)).toBe('category')
        expect(gridItems().filter((item) => item === 'ad')).toHaveLength(
            Math.floor((categories.length - 1) / AD_EVERY_N_CATEGORIES)
        )
    })

    // A whole row of the two-column grid, so the cards around it stay aligned.
    test('every ad spans the full row of the grid', () => {
        renderHome()
        const ads = screen.getAllByRole('complementary', {
            name: 'Advertisement',
        })
        expect(ads.length).toBeGreaterThan(0)
        for (const ad of ads) expect(ad.classList).toContain('col-span-full')
    })

    test('each ad row is shaped like a category card', () => {
        renderHome()
        for (const ad of screen.getAllByRole('complementary', {
            name: 'Advertisement',
        })) {
            expect(ad.classList).toContain('rounded-2xl')
            expect(ad.classList).toContain('border')
            expect(ad.classList).toContain('bg-surface')
        }
    })
})

const requestedSlots = () =>
    [...document.querySelectorAll('ins.adsbygoogle')].map((ins) =>
        ins.getAttribute('data-ad-slot')
    )

const loadAds = async () => {
    fireEvent.keyDown(window)
    act(() => mockAllIsIntersecting(true))
    await vi.waitFor(() => expect(requestedSlots().length).toBeGreaterThan(0))
}

describe.each([
    [390, 'w-80 h-25', '1111111111', '2222222222'],
    [639, 'w-80 h-25', '1111111111', '2222222222'],
    [640, 'w-117 h-15', '2222222222', '1111111111'],
    [1440, 'w-117 h-15', '2222222222', '1111111111'],
])('HomePage ads at %ipx', (width, classes, shown, hidden) => {
    beforeEach(() => setMedia({ width }))

    test(`reserves ${classes} in every ad row`, () => {
        renderHome()
        const boxes = document.querySelectorAll('[data-ad-box]')
        expect(boxes.length).toBeGreaterThan(0)
        for (const box of boxes) {
            for (const name of classes.split(' ')) {
                expect(box.classList).toContain(name)
            }
        }
    })

    test('requests only the unit that fits the row', async () => {
        renderHome()
        await loadAds()
        expect(requestedSlots()).toContain(shown)
        expect(requestedSlots()).not.toContain(hidden)
    })
})
