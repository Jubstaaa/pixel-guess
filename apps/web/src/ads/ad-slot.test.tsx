import { act, fireEvent, render } from '@testing-library/react'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import html from '../../index.html?raw'

import type { AdSlot as AdSlotComponent, AdSize } from './ad-slot'

declare global {
    interface Window {
        adsbygoogle?: unknown[]
    }
}

let AdSlot: typeof AdSlotComponent

// The "has the visitor interacted yet" flag is page-wide, so every test gets a
// fresh copy of the module.
beforeEach(async () => {
    vi.resetModules()
    delete window.adsbygoogle
    ;({ AdSlot } = await import('./ad-slot'))
})

const renderAt = (
    slot: string | null,
    path = '/movies/easy',
    size: AdSize = 'mediumRectangle'
) => {
    const router = createMemoryRouter(
        [{ path: '*', element: <AdSlot placement={{ size, slot }} /> }],
        { initialEntries: [path] }
    )
    return { router, ...render(<RouterProvider router={router} />) }
}

const ad = () => document.querySelector('ins.adsbygoogle')
const adScript = () =>
    document.querySelector<HTMLScriptElement>('script[src*="adsbygoogle.js"]')

describe('AdSlot', () => {
    test('renders nothing until a slot id is configured', () => {
        const { container } = renderAt(null)
        expect(container.innerHTML).toBe('')
    })

    // Each box is exactly the fixed size of its unit, so the ad that arrives
    // later shifts nothing.
    test.each([
        ['mediumRectangle', 'w-75 h-62.5', 300, 250],
        ['wideSkyscraper', 'w-40 h-150', 160, 600],
        ['mobileBanner', 'w-80 h-12.5', 320, 50],
    ] as const)(
        'reserves the %s box before anything loads and fills it exactly',
        async (size, classes, width, height) => {
            const { container } = renderAt('1234567890', '/movies/easy', size)
            const box = container.querySelector('[data-ad-box]')
            for (const name of classes.split(' ')) {
                expect(box?.classList).toContain(name)
            }

            fireEvent.keyDown(window)
            act(() => mockAllIsIntersecting(true))
            await vi.waitFor(() => expect(ad()).not.toBeNull())
            expect(ad()?.getAttribute('style')).toContain(`width: ${width}px`)
            expect(ad()?.getAttribute('style')).toContain(`height: ${height}px`)
        }
    )

    // The script renders in the same branch as the ad, and React keeps a
    // hoisted script for the whole document, so the queue is the reliable sign.
    test('requests no ad and loads no script before the visitor interacts', () => {
        renderAt('1234567890')
        act(() => mockAllIsIntersecting(true))
        expect(ad()).toBeNull()
        expect(window.adsbygoogle).toBeUndefined()
    })

    test('requests no ad while the slot is off screen', () => {
        renderAt('1234567890')
        act(() => mockAllIsIntersecting(false))
        fireEvent.pointerDown(window)
        expect(ad()).toBeNull()
    })

    test('requests a fixed-size ad once visible and the visitor has interacted', async () => {
        renderAt('1234567890')
        fireEvent.keyDown(window)
        act(() => mockAllIsIntersecting(true))
        await vi.waitFor(() => expect(ad()).not.toBeNull())

        expect(ad()?.getAttribute('data-ad-client')).toBe(
            'ca-pub-5250650495212334'
        )
        expect(ad()?.getAttribute('data-ad-slot')).toBe('1234567890')
        expect(adScript()?.src).toBe(
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5250650495212334'
        )
        expect(window.adsbygoogle).toEqual([{}])
    })

    test('requests a new ad for each page of the single-page app', async () => {
        const { router } = renderAt('1234567890')
        fireEvent.scroll(window)
        act(() => mockAllIsIntersecting(true))
        await vi.waitFor(() => expect(ad()).not.toBeNull())
        const first = ad()

        await act(() => router.navigate('/flags/hard'))
        act(() => mockAllIsIntersecting(true))
        await vi.waitFor(() => expect(ad()).not.toBe(first))

        expect(ad()).not.toBeNull()
        expect(window.adsbygoogle).toHaveLength(2)
        expect(
            document.querySelectorAll('script[src*="adsbygoogle.js"]')
        ).toHaveLength(1)
    })
})

describe('index.html', () => {
    test('does not put the AdSense code on every page up front', () => {
        expect(html).not.toContain('adsbygoogle')
        expect(html).not.toContain('enable_page_level_ads')
    })
})
