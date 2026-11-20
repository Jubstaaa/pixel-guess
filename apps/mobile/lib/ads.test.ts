import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from '@jest/globals'
import * as ReactNative from 'react-native'

import type * as AdsModule from './ads'
import { getInterstitialAdUnitId } from './ads'

const IOS_UNIT = 'ca-app-pub-5250650495212334/6351511966'
const ANDROID_UNIT = 'ca-app-pub-5250650495212334/2343600377'
const TEST_UNIT = 'ca-app-pub-3940256099942544/4411468910'

const mockCalls: string[] = []

const mockConsent = {
    canRequestAds: true,
    gatherFails: false,
    gdprApplies: true,
    initializeFails: false,
    privacyOptionsRequirementStatus: 'NOT_REQUIRED',
    selectPersonalisedAds: true,
    trackingGranted: true,
}

jest.mock('react-native-google-mobile-ads', () => ({
    __esModule: true,
    AdsConsent: {
        gatherConsent: jest.fn(() => {
            mockCalls.push('gatherConsent')
            return mockConsent.gatherFails
                ? Promise.reject(new Error('network'))
                : Promise.resolve({})
        }),
        getConsentInfo: jest.fn(() =>
            Promise.resolve({
                canRequestAds: mockConsent.canRequestAds,
                privacyOptionsRequirementStatus:
                    mockConsent.privacyOptionsRequirementStatus,
            })
        ),
        getGdprApplies: jest.fn(() => Promise.resolve(mockConsent.gdprApplies)),
        getUserChoices: jest.fn(() =>
            Promise.resolve({
                selectPersonalisedAds: mockConsent.selectPersonalisedAds,
            })
        ),
        showPrivacyOptionsForm: jest.fn(() => {
            mockCalls.push('showPrivacyOptionsForm')
            return Promise.resolve({})
        }),
    },
    AdsConsentPrivacyOptionsRequirementStatus: {
        NOT_REQUIRED: 'NOT_REQUIRED',
        REQUIRED: 'REQUIRED',
        UNKNOWN: 'UNKNOWN',
    },
    default: () => ({
        initialize: () => {
            mockCalls.push('initialize')
            return mockConsent.initializeFails
                ? Promise.reject(new Error('sdk'))
                : Promise.resolve([])
        },
    }),
}))

jest.mock('expo-tracking-transparency', () => ({
    requestTrackingPermissionsAsync: () => {
        mockCalls.push('requestTracking')
        return Promise.resolve({ granted: mockConsent.trackingGranted })
    },
}))

// The preset mocks currentState as a jest.fn, which never reads as foregrounded.
Object.assign(ReactNative.AppState, { currentState: 'active' })

// initializeAds memoizes its promise, so each test needs a fresh module.
const loadAds = () => {
    let ads: typeof AdsModule | undefined
    jest.isolateModules(() => {
        ads = require('./ads') as typeof AdsModule
    })
    if (!ads) throw new Error('ads module failed to load')
    return ads
}

beforeEach(() => {
    mockCalls.length = 0
    Object.assign(mockConsent, {
        canRequestAds: true,
        gatherFails: false,
        gdprApplies: true,
        initializeFails: false,
        privacyOptionsRequirementStatus: 'NOT_REQUIRED',
        selectPersonalisedAds: true,
        trackingGranted: true,
    })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('initializeAds', () => {
    test('gathers UMP consent before ATT and before starting the SDK', async () => {
        await loadAds().initializeAds()

        expect(mockCalls).toEqual([
            'gatherConsent',
            'requestTracking',
            'initialize',
        ])
    })

    test('never starts the SDK when consent does not allow requesting ads', async () => {
        mockConsent.canRequestAds = false

        const state = await loadAds().initializeAds()

        expect(state.canRequestAds).toBe(false)
        expect(mockCalls).not.toContain('initialize')
    })

    test('still starts the SDK on a gather error when the previous session allows ads', async () => {
        mockConsent.gatherFails = true

        const state = await loadAds().initializeAds()

        expect(state.canRequestAds).toBe(true)
        expect(mockCalls).toContain('initialize')
    })

    test('requests no ads when the SDK fails to start', async () => {
        mockConsent.initializeFails = true

        const state = await loadAds().initializeAds()

        expect(state.canRequestAds).toBe(false)
    })

    test('allows personalized ads only with ATT and GDPR personalization consent', async () => {
        expect((await loadAds().initializeAds()).isPersonalizationAllowed).toBe(
            true
        )

        mockConsent.selectPersonalisedAds = false
        expect((await loadAds().initializeAds()).isPersonalizationAllowed).toBe(
            false
        )

        mockConsent.selectPersonalisedAds = true
        mockConsent.trackingGranted = false
        expect((await loadAds().initializeAds()).isPersonalizationAllowed).toBe(
            false
        )
    })

    test('allows personalized ads where GDPR does not apply', async () => {
        mockConsent.gdprApplies = false
        mockConsent.selectPersonalisedAds = false

        const state = await loadAds().initializeAds()

        expect(state.isPersonalizationAllowed).toBe(true)
    })

    test('reports when the privacy options entry point is required', async () => {
        expect((await loadAds().initializeAds()).isPrivacyOptionsRequired).toBe(
            false
        )

        mockConsent.privacyOptionsRequirementStatus = 'REQUIRED'
        expect((await loadAds().initializeAds()).isPrivacyOptionsRequired).toBe(
            true
        )
    })
})

describe('showPrivacyOptions', () => {
    test('opens the UMP privacy options form', async () => {
        await loadAds().showPrivacyOptions()

        expect(mockCalls).toEqual(['showPrivacyOptionsForm'])
    })
})

describe('getInterstitialAdUnitId', () => {
    const asRelease = () => {
        jest.replaceProperty(
            globalThis as unknown as { __DEV__: boolean },
            '__DEV__',
            false
        )
    }

    test('uses the Google test unit in development', () => {
        expect(getInterstitialAdUnitId()).toBe(TEST_UNIT)
    })

    test('uses the iOS unit in an iOS release build', () => {
        asRelease()

        expect(getInterstitialAdUnitId()).toBe(IOS_UNIT)
    })

    test('uses the Android unit in an Android release build', () => {
        asRelease()
        // jest-expo runs tests against Platform.ios; mirror Platform.android.
        jest.spyOn(ReactNative.Platform, 'select').mockImplementation(
            (spec: {
                android?: unknown
                default?: unknown
                native?: unknown
            }) =>
                'android' in spec
                    ? spec.android
                    : 'native' in spec
                      ? spec.native
                      : spec.default
        )

        expect(getInterstitialAdUnitId()).toBe(ANDROID_UNIT)
    })
})
