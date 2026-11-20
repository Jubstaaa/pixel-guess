import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import type { AdsConsentState } from '@/lib/ads'

import { useInterstitialAd } from './use-interstitial-ad'

const AD_UNIT = 'test-unit'
// Math.random() === 0 puts every ad threshold at the minimum interval.
const FIRST_THRESHOLD = 4

type Listener = () => void

const mockListeners = new Map<string, Listener>()

const mockCreateForAdRequest = jest.fn((_unitId: string, _options: object) => ({
    addAdEventListener: (event: string, listener: Listener) => {
        mockListeners.set(event, listener)
    },
    load: jest.fn(),
    show: jest.fn(() => Promise.resolve()),
}))

const mockInitializeAds = jest.fn<() => Promise<AdsConsentState>>()

jest.mock('react-native-google-mobile-ads', () => ({
    AdEventType: { CLOSED: 'closed', ERROR: 'error', LOADED: 'loaded' },
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

const emit = (event: string) =>
    act(() => {
        mockListeners.get(event)?.()
    })

const expectAdRequests = (count: number) =>
    waitFor(() => expect(mockCreateForAdRequest).toHaveBeenCalledTimes(count))

beforeEach(() => {
    mockCreateForAdRequest.mockClear()
    mockListeners.clear()
    jest.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
    jest.restoreAllMocks()
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

    test('applies consent changed since the previous ad to the next request', async () => {
        mockInitializeAds.mockResolvedValue(consentState({}))
        await renderHook(() => useInterstitialAd())
        await expectAdRequests(1)

        mockInitializeAds.mockResolvedValue(
            consentState({ isPersonalizationAllowed: false })
        )
        await emit('closed')

        await waitFor(() =>
            expect(mockCreateForAdRequest).toHaveBeenLastCalledWith(AD_UNIT, {
                requestNonPersonalizedAdsOnly: true,
            })
        )
    })

    test('stops requesting ads once consent is withdrawn', async () => {
        mockInitializeAds.mockResolvedValue(consentState({}))
        await renderHook(() => useInterstitialAd())
        await expectAdRequests(1)

        const withdrawn = Promise.resolve(
            consentState({ canRequestAds: false })
        )
        mockInitializeAds.mockReturnValue(withdrawn)
        await emit('closed')
        await withdrawn

        expect(mockCreateForAdRequest).toHaveBeenCalledTimes(1)
    })

    test('retries a failed load when the next ad is due', async () => {
        mockInitializeAds.mockResolvedValue(consentState({}))
        const { result } = await renderHook(() => useInterstitialAd())
        await expectAdRequests(1)

        await emit('error')
        await act(() => {
            for (let guess = 0; guess < FIRST_THRESHOLD; guess += 1) {
                result.current.onCorrectGuess()
            }
        })

        await expectAdRequests(2)
    })
})
