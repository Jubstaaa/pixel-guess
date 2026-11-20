import { describe, expect, jest, test } from '@jest/globals'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
import { Alert } from 'react-native'

import type { AdsConsentState } from '@/lib/ads'

import { PrivacyOptionsLink } from './privacy-options-link'

const mockInitializeAds = jest.fn<() => Promise<AdsConsentState>>()
const mockShowPrivacyOptions = jest.fn(() => Promise.resolve())

jest.mock('@/lib/ads', () => ({
    initializeAds: () => mockInitializeAds(),
    showPrivacyOptions: () => mockShowPrivacyOptions(),
}))

const withPrivacyOptions = (isPrivacyOptionsRequired: boolean) =>
    mockInitializeAds.mockResolvedValue({
        canRequestAds: true,
        isPersonalizationAllowed: true,
        isPrivacyOptionsRequired,
    })

describe('PrivacyOptionsLink', () => {
    test('stays hidden when the privacy options entry point is not required', async () => {
        withPrivacyOptions(false)

        await render(<PrivacyOptionsLink />)

        expect(
            screen.queryByRole('button', { name: 'Privacy options' })
        ).toBeNull()
    })

    test('opens the privacy options form when required', async () => {
        withPrivacyOptions(true)

        await render(<PrivacyOptionsLink />)
        await fireEvent.press(
            await screen.findByRole('button', { name: 'Privacy options' })
        )

        expect(mockShowPrivacyOptions).toHaveBeenCalledTimes(1)
    })

    test('tells the user when the form cannot be shown', async () => {
        withPrivacyOptions(true)
        mockShowPrivacyOptions.mockRejectedValueOnce(new Error('offline'))
        const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {})

        await render(<PrivacyOptionsLink />)
        await fireEvent.press(
            await screen.findByRole('button', { name: 'Privacy options' })
        )

        await waitFor(() => expect(alert).toHaveBeenCalledTimes(1))
        alert.mockRestore()
    })
})
