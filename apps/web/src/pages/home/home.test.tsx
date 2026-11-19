import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import { categories } from '@pixel-guess/shared'

import { AD_EVERY_N_CATEGORIES, HomePage } from './home'

vi.mock('../../ads/ad-placements', () => ({
    adPlacements: {
        homeInList: { size: 'mediumRectangle', slot: '1234567890' },
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

    test('uses the fixed 300x250 unit for every in-list ad', () => {
        renderHome()
        for (const box of document.querySelectorAll('[data-ad-box]')) {
            expect(box.classList).toContain('w-75')
            expect(box.classList).toContain('h-62.5')
        }
    })
})
