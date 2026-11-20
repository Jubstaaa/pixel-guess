import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import { categories } from '@pixel-guess/shared'

import { AboutPage } from './about'
import { HomePage } from './home/home'
import { HowToPlayPage } from './how-to-play'
import { NotFoundPage } from './not-found'
import { TermsOfServicePage } from './terms-of-service'

vi.mock('../ads/ad-placements', () => ({
    adPlacements: {
        homeListMobile: { size: 'largeMobileBanner', slot: '1111111111' },
        homeListWide: { size: 'banner', slot: '2222222222' },
    },
}))

const renderPage = (page: ReactElement) =>
    render(
        <RouterProvider
            router={createMemoryRouter([{ path: '/', element: page }])}
        />
    )

const pageText = () =>
    `${document.body.textContent} ${[...document.head.querySelectorAll('meta[name="description"]')].map((m) => m.getAttribute('content')).join(' ')}`

describe.each([
    ['home', <HomePage key="home" />],
    ['about', <AboutPage key="about" />],
    ['how to play', <HowToPlayPage key="how" />],
    ['terms', <TermsOfServicePage key="terms" />],
])('%s copy', (_name, page) => {
    test('states the real number of categories', () => {
        renderPage(page)
        expect(pageText()).not.toMatch(/\d+\+ categories/i)
    })

    // The web game keeps no score history, so promising one misleads.
    test('does not promise streak tracking', () => {
        renderPage(page)
        expect(pageText()).not.toMatch(/streak/i)
    })
})

test.each([
    ['home', <HomePage key="home" />],
    ['about', <AboutPage key="about" />],
    ['how to play', <HowToPlayPage key="how" />],
])('%s names the category count from the data', (_name, page) => {
    renderPage(page)
    expect(pageText()).toContain(`${categories.length} categories`)
})

// The server answers every unknown path with the app, so the page itself has
// to keep those URLs out of search results.
test('the not-found page asks search engines not to index it', () => {
    renderPage(<NotFoundPage />)
    expect(
        document.head
            .querySelector('meta[name="robots"]')
            ?.getAttribute('content')
    ).toBe('noindex')
})
