import { charactersByCategory } from '@pixel-guess/shared'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { setMedia } from 'mock-match-media'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { GamePage } from './game'

vi.mock('./confetti', () => ({ triggerConfetti: vi.fn() }))
vi.mock('../../ads/ad-placements', () => ({
    adPlacements: {
        gameMobile: { size: 'mobileBanner', slot: '2222222222' },
        gameSidebar: { size: 'wideSkyscraper', slot: '1111111111' },
    },
}))

const flags = charactersByCategory.flags ?? []

const answer = flags[0]?.name ?? ''
const wrong = flags[1]?.name ?? ''

const renderGame = (path = '/flags/easy') =>
    render(
        <RouterProvider
            router={createMemoryRouter(
                [
                    {
                        element: <GamePage />,
                        path: '/:categorySlug/:difficulty',
                    },
                    { element: <p>home</p>, path: '/' },
                ],
                { initialEntries: [path] }
            )}
        />
    )

const search = () => screen.getByRole('combobox', { name: /guess/i })

const guess = (name: string) => {
    fireEvent.change(search(), { target: { value: name } })
    fireEvent.click(screen.getByRole('option', { name }))
}

beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

describe('GamePage', () => {
    test('sends unknown categories back home', () => {
        renderGame('/not-a-category/easy')
        expect(screen.getByText('home')).toBeTruthy()
    })

    test('sends unknown difficulties back home', () => {
        renderGame('/flags/medium')
        expect(screen.getByText('home')).toBeTruthy()
    })

    test('the back link is named for screen readers', () => {
        renderGame()
        expect(
            screen.getByRole('link', { name: 'Back to categories' })
        ).toBeTruthy()
    })

    test('a wrong guess disappears from the suggestions', () => {
        renderGame()
        guess(wrong)
        fireEvent.change(search(), { target: { value: wrong } })
        expect(screen.queryByRole('option', { name: wrong })).toBeNull()
    })

    test('guessing is blocked while the answer is revealed', () => {
        vi.useFakeTimers()
        renderGame()
        guess(answer)
        expect((search() as HTMLInputElement).disabled).toBe(true)
        expect(
            screen.getByRole<HTMLButtonElement>('button', { name: /skip/i })
                .disabled
        ).toBe(true)
        vi.useRealTimers()
    })

    test('the next round starts after the reveal with every suggestion back', () => {
        vi.useFakeTimers()
        renderGame()
        guess(wrong)
        guess(answer)
        act(() => {
            vi.advanceTimersByTime(2000)
        })
        expect((search() as HTMLInputElement).disabled).toBe(false)
        fireEvent.change(search(), { target: { value: wrong } })
        expect(screen.getByRole('option', { name: wrong })).toBeTruthy()
        vi.useRealTimers()
    })
})

const ads = () =>
    screen.queryAllByRole('complementary', { name: 'Advertisement' })
const firstAd = () => {
    const [ad] = ads()
    if (!ad) throw new Error('expected an advertisement')
    return ad
}
const requestedSlots = () =>
    [...document.querySelectorAll('ins.adsbygoogle')].map(ins =>
        ins.getAttribute('data-ad-slot')
    )
const follows = (a: Node, b: Node) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

const loadAds = async () => {
    fireEvent.keyDown(window)
    act(() => mockAllIsIntersecting(true))
    await vi.waitFor(() => expect(requestedSlots().length).toBeGreaterThan(0))
}

describe.each([1440, 1920])('GamePage ads at %ipx', width => {
    beforeEach(() => setMedia({ width }))

    test('puts a 160x600 ad in each gutter beside the game', () => {
        renderGame()
        expect(ads()).toHaveLength(2)
        const gutters = ads().map(ad =>
            [...ad.classList].find(c => /^(left|right)-/.test(c))
        )
        expect(gutters.map(c => c?.split('-')[0]).sort()).toEqual([
            'left',
            'right',
        ])
        for (const ad of ads()) {
            expect(ad.querySelector('[data-ad-box]')?.classList).toContain(
                'h-150'
            )
        }
    })

    test('the sidebars come after the game in keyboard order', () => {
        renderGame()
        for (const ad of ads()) expect(follows(search(), ad)).toBe(true)
    })

    test('requests only the sidebar ads, never the mobile banner', async () => {
        renderGame()
        await loadAds()
        expect(requestedSlots()).toEqual(['1111111111', '1111111111'])
    })
})

describe.each([390, 1279])('GamePage ads at %ipx', width => {
    beforeEach(() => setMedia({ width }))

    test('shows one 320x50 banner below the guess input', () => {
        renderGame()
        expect(ads()).toHaveLength(1)
        const box = firstAd().querySelector('[data-ad-box]')
        expect(box?.classList).toContain('w-80')
        expect(box?.classList).toContain('h-12.5')
        expect(follows(search(), firstAd())).toBe(true)
    })

    test('requests only the banner, never the hidden sidebar ads', async () => {
        renderGame()
        await loadAds()
        expect(requestedSlots()).toEqual(['2222222222'])
    })
})

describe('GamePage ads', () => {
    test('the game column is the same with and without the sidebars', () => {
        const column = () =>
            screen.getByRole('link', { name: 'Back to categories' })
                .parentElement!.parentElement!
        setMedia({ width: 390 })
        renderGame()
        const narrow = column().className

        act(() => setMedia({ width: 1440 }))
        expect(column().className).toBe(narrow)
        for (const ad of ads()) expect(ad.classList).toContain('absolute')
    })

    test.each([390, 1440])(
        'no ad sits between the header and the image at %ipx',
        width => {
            setMedia({ width })
            renderGame()
            const header = screen.getByRole('link', {
                name: 'Back to categories',
            })
            const canvas = document.querySelector('canvas')!
            for (const ad of ads()) {
                expect(follows(header, ad) && follows(ad, canvas)).toBe(false)
            }
        }
    )

    test('swaps the placements when the screen crosses the breakpoint', () => {
        setMedia({ width: 1440 })
        renderGame()
        expect(ads()).toHaveLength(2)

        act(() => setMedia({ width: 390 }))
        expect(ads()).toHaveLength(1)
        expect(firstAd().querySelector('[data-ad-box]')?.classList).toContain(
            'h-12.5'
        )

        act(() => setMedia({ width: 1440 }))
        expect(ads()).toHaveLength(2)
    })
})
