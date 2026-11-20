import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import { AppState, Platform } from 'react-native'

import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'

const TEST_INTERSTITIAL_UNIT_ID = 'ca-app-pub-3940256099942544/4411468910'
const INTERSTITIAL_UNIT_IDS = {
    android: 'ca-app-pub-5250650495212334/2343600377',
    ios: 'ca-app-pub-5250650495212334/6351511966',
}

export interface AdsConsentState {
    canRequestAds: boolean
    isPersonalizationAllowed: boolean
    isPrivacyOptionsRequired: boolean
}

const NO_ADS: AdsConsentState = {
    canRequestAds: false,
    isPersonalizationAllowed: false,
    isPrivacyOptionsRequired: false,
}

let consentPromise: Promise<AdsConsentState> | null = null

export const getInterstitialAdUnitId = () =>
    __DEV__
        ? TEST_INTERSTITIAL_UNIT_ID
        : Platform.select({
              android: INTERSTITIAL_UNIT_IDS.android,
              default: INTERSTITIAL_UNIT_IDS.ios,
          })

// The native module is missing in Expo Go, so it is required lazily and a
// missing module is treated as "no ads" rather than a crash.
const loadNativeAds = () => {
    try {
        return require('react-native-google-mobile-ads') as typeof GoogleMobileAds
    } catch {
        return null
    }
}

// Neither the UMP form nor ATTrackingManager is shown unless the app is already
// foregrounded; asking straight from the root layout's effect can resolve
// without the user ever seeing a prompt.
const waitUntilActive = () =>
    new Promise<void>((resolve) => {
        if (AppState.currentState === 'active') {
            resolve()

            return
        }

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                subscription.remove()
                resolve()
            }
        })
    })

const gatherConsent = async ({ AdsConsent }: typeof GoogleMobileAds) => {
    try {
        await AdsConsent.gatherConsent()
    } catch {
        // Google's guidance: on a gather error still try to request ads; UMP
        // then answers with the consent stored from the previous session.
    }

    return AdsConsent.getConsentInfo()
}

const requestTracking = async () => {
    try {
        const { granted } = await requestTrackingPermissionsAsync()

        return granted
    } catch {
        // Tracking Transparency unavailable (simulator, older iOS): no IDFA.
        return false
    }
}

const hasPersonalizationConsent = async ({
    AdsConsent,
}: typeof GoogleMobileAds) => {
    if (!(await AdsConsent.getGdprApplies())) return true

    const { selectPersonalisedAds } = await AdsConsent.getUserChoices()

    return selectPersonalisedAds
}

const requestConsentAndInitialize = async (): Promise<AdsConsentState> => {
    const ads = loadNativeAds()
    if (!ads) return NO_ADS

    await waitUntilActive()

    const { canRequestAds, privacyOptionsRequirementStatus } =
        await gatherConsent(ads)
    const isPrivacyOptionsRequired =
        privacyOptionsRequirementStatus ===
        ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED

    if (!canRequestAds) return { ...NO_ADS, isPrivacyOptionsRequired }

    // ATT comes after the UMP message, the order Google's sample uses.
    const isTrackingGranted = await requestTracking()

    await ads.default().initialize()

    return {
        canRequestAds,
        isPersonalizationAllowed:
            isTrackingGranted && (await hasPersonalizationConsent(ads)),
        isPrivacyOptionsRequired,
    }
}

export const initializeAds = () => {
    // Ads are optional: a consent or SDK failure must never break the game, so
    // the session simply runs without them.
    consentPromise ??= requestConsentAndInitialize().catch(() => NO_ADS)

    return consentPromise
}

export const showPrivacyOptions = async () => {
    await loadNativeAds()?.AdsConsent.showPrivacyOptionsForm()
}
