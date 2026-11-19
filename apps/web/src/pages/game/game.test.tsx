import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { charactersByCategory } from '@pixel-guess/shared'

import { GamePage } from './game'

vi.mock('./confetti', () => ({ triggerConfetti: vi.fn() }))
vi.mock('../../ads/ad-slots', () => ({
    adSlots: { game: '1234567890', home: null },
}))

const flags = charactersByCategory.flags!
// Math.random() === 0 always picks the first unseen character.
const answer = flags[0]!.name
const wrong = flags[1]!.name

const renderGame = (path = '/flags/easy') =>
    render(
        <RouterProvider
            router={createMemoryRouter(
                [
                    {
                        path: '/:categorySlug/:difficulty',
                        element: <GamePage />,
                    },
                    { path: '/', element: <p>home</p> },
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
            (screen.getByRole('button', { name: /skip/i }) as HTMLButtonElement)
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

    test('the ad sits below the game, never between the header and the image', () => {
        renderGame()
        const ad = screen.getByRole('complementary', { name: 'Advertisement' })
        const image = document.querySelector('canvas')!
        const follows = (a: Node, b: Node) =>
            Boolean(
                a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
            )
        expect(follows(image, ad)).toBe(true)
        expect(follows(search(), ad)).toBe(true)
    })
})
