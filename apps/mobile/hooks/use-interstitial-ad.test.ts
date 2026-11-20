import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'

import type { AdsConsentState } from '@/lib/ads'

import { useInterstitialAd } from './use-interstitial-ad'

const AD_UNIT = 'test-unit'

const mockCreateForAdRequest = jest.fn((_unitId: string, _options: object) => ({
    addAdEventListener: jest.fn(),
    load: jest.fn(),
    show: jest.fn(() => Promise.resolve()),
}))

const mockInitializeAds = jest.fn<() => Promise<AdsConsentState>>()

jest.mock('react-native-google-mobile-ads', () => ({
    AdEventType: { CLOSED: 'closed', LOADED: 'loaded' },
    InterstitialAd: { createForAdRequest: mockCreateForAdRequest },
}))

jest.mock('@/lib/ads', () => ({
    getInterstitialAdUnitId: () => 'test-unit',
    initializeAds: () => mockInitializeAds(),
}))

const consentState = (state: Partial<AdsConsentState>): AdsConsentState => ({
    canRequestAds: true,
    isPersonalizationAllowed: true,
    isPrivacyOptionsRequired: false,
    ...state,
})

beforeEach(() => {
    mockCreateForAdRequest.mockClear()
})

describe('useInterstitialAd', () => {
    test('requests no ad when consent does not allow requesting ads', async () => {
        const consent = Promise.resolve(consentState({ canRequestAds: false }))
        mockInitializeAds.mockReturnValue(consent)

        await renderHook(() => useInterstitialAd())
        await consent

        expect(mockCreateForAdRequest).not.toHaveBeenCalled()
    })

    test('requests non-personalized ads when personalization is not allowed', async () => {
        mockInitializeAds.mockResolvedValue(
            consentState({ isPersonalizationAllowed: false })
        )

        await renderHook(() => useInterstitialAd())

        await waitFor(() =>
            expect(mockCreateForAdRequest).toHaveBeenCalledWith(AD_UNIT, {
                requestNonPersonalizedAdsOnly: true,
            })
        )
    })

    test('requests personalized ads when consent and ATT allow it', async () => {
        mockInitializeAds.mockResolvedValue(consentState({}))

        await renderHook(() => useInterstitialAd())

        await waitFor(() =>
            expect(mockCreateForAdRequest).toHaveBeenCalledWith(AD_UNIT, {
                requestNonPersonalizedAdsOnly: false,
            })
        )
    })
})
