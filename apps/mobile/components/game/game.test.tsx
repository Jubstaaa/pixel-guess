import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import type * as ReactModule from 'react'
import type * as ReactNative from 'react-native'

import { charactersByCategory, MAX_COUNT } from '@pixel-guess/shared'

import { Game } from './game'

const mockOnCorrectGuess = jest.fn()

jest.mock('@/hooks/use-interstitial-ad', () => ({
    useInterstitialAd: () => ({ onCorrectGuess: mockOnCorrectGuess }),
}))

// Skia needs a native canvas; the stub exposes the two props the game drives.
jest.mock('../pixelated-image/pixelated-image', () => {
    const { Text } = jest.requireActual<typeof ReactNative>('react-native')
    return {
        PixelatedImage: ({
            count,
            imageUrl,
        }: {
            count: number
            imageUrl: string
        }) => <Text testID="pixelated-image">{`${imageUrl}|${count}`}</Text>,
    }
})

jest.mock('react-native-confetti-cannon', () => {
    const { Component } = jest.requireActual<typeof ReactModule>('react')
    return class ConfettiCannon extends Component {
        start() {}
        render() {
            return null
        }
    }
})

jest.mock('expo-image', () => ({ Image: () => null }))

jest.mock('lucide-react-native', () => ({ SkipForward: () => null }))

const REVEAL_MS = 2000

const flags = charactersByCategory.flags
// Math.random() === 0 always picks the first unseen character.
const [first, second] = flags

const shownImage = () => screen.getByTestId('pixelated-image')

const expectShowing = (imageUrl: string, count: number) =>
    expect(shownImage()).toHaveTextContent(`${imageUrl}|${count}`)

const search = () => screen.getByPlaceholderText('Search character...')

const guess = async (name: string) => {
    await fireEvent.changeText(search(), name)
    await fireEvent.press(screen.getByText(name))
}

const finishReveal = () =>
    act(() => {
        jest.advanceTimersByTime(REVEAL_MS)
    })

const renderGame = () => render(<Game categorySlug="flags" levelType={0} />)

beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(Math, 'random').mockReturnValue(0)
    mockOnCorrectGuess.mockClear()
})

afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
})

describe('Game', () => {
    test('a correct guess reveals the image, then moves to the next character', async () => {
        await renderGame()
        expectShowing(first.imageUrl, 0)

        await guess(first.name)

        expectShowing(first.imageUrl, MAX_COUNT)
        expect(mockOnCorrectGuess).toHaveBeenCalledTimes(1)

        await finishReveal()

        expectShowing(second.imageUrl, 0)
        expect(search()).toHaveDisplayValue('')
    })

    test('a wrong guess sharpens the image and keeps the character', async () => {
        await renderGame()

        await guess(second.name)

        expectShowing(first.imageUrl, 1)
        expect(mockOnCorrectGuess).not.toHaveBeenCalled()
    })

    test('running out of guesses reveals the answer, then moves on', async () => {
        await renderGame()

        for (const character of flags.slice(1, MAX_COUNT + 1)) {
            await guess(character.name)
        }

        expectShowing(first.imageUrl, MAX_COUNT)

        await finishReveal()

        expectShowing(second.imageUrl, 0)
    })

    test('skip reveals the answer, then moves to the next character', async () => {
        await renderGame()

        await fireEvent.press(screen.getByText('Skip'))

        expectShowing(first.imageUrl, MAX_COUNT)

        await finishReveal()

        expectShowing(second.imageUrl, 0)
    })

    test('the search input is read-only while the answer is revealed', async () => {
        await renderGame()

        await fireEvent.press(screen.getByText('Skip'))

        expect(search()).toHaveProp('editable', false)
    })

    test('a guess picked from the open list during the reveal does not advance twice', async () => {
        await renderGame()

        await fireEvent.changeText(search(), first.name)
        await fireEvent.press(screen.getByText('Skip'))
        await fireEvent.press(screen.getByText(first.name))
        await finishReveal()

        expect(mockOnCorrectGuess).not.toHaveBeenCalled()
        expectShowing(second.imageUrl, 0)
    })

    test('leaving the screen during the reveal cancels the pending round change', async () => {
        const { unmount } = await renderGame()

        await fireEvent.press(screen.getByText('Skip'))
        await unmount()
        // Picking the next character is the only consumer of Math.random here.
        const picksBeforeTimeout = jest.mocked(Math.random).mock.calls.length
        await finishReveal()

        expect(jest.mocked(Math.random)).toHaveBeenCalledTimes(
            picksBeforeTimeout
        )
    })
})
