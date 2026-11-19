import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'

import { Footer } from './footer'

test('every footer link has an accessible name', () => {
    render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    )
    for (const link of screen.getAllByRole('link')) {
        expect(
            link.textContent?.trim() ||
                link.getAttribute('aria-label') ||
                link.querySelector('img[alt]:not([alt=""])')
        ).toBeTruthy()
    }
    expect(screen.getByRole('link', { name: 'Email' })).toBeTruthy()
})
