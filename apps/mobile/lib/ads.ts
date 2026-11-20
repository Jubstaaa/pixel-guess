import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import type { AdsConsentInfo } from 'react-native-google-mobile-ads'
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
let sdkStart: Promise<boolean> | null = null

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

// GDPR is the only regime whose personalisation choice the app reads itself;
// US state opt-outs travel in the GPP string, which the SDK applies per request.
const hasPersonalizationConsent = async ({
    AdsConsent,
}: typeof GoogleMobileAds) => {
    try {
        if (!(await AdsConsent.getGdprApplies())) return true

        const { selectPersonalisedAds } = await AdsConsent.getUserChoices()

        return selectPersonalisedAds
    } catch {
        // An unreadable consent record must never be read as a yes.
        return false
    }
}

// Resolves whether ATT was granted. Runs once, whether consent arrives at
// launch or later through the privacy options form.
const startSdk = (ads: typeof GoogleMobileAds) => {
    sdkStart ??= (async () => {
        // ATT comes after the UMP message, the order Google's sample uses.
        const isTrackingGranted = await requestTracking()

        await ads.default().initialize()

        return isTrackingGranted
    })()

    return sdkStart
}

const toConsentState = async (
    ads: typeof GoogleMobileAds,
    { canRequestAds, privacyOptionsRequirementStatus }: AdsConsentInfo
): Promise<AdsConsentState> => {
    const isPrivacyOptionsRequired =
        privacyOptionsRequirementStatus ===
        ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED

    if (!canRequestAds) return { ...NO_ADS, isPrivacyOptionsRequired }

    let isTrackingGranted: boolean
    try {
        isTrackingGranted = await startSdk(ads)
    } catch {
        // Without a started SDK there are no ads, but the user must still be
        // able to reach the privacy options.
        return { ...NO_ADS, isPrivacyOptionsRequired }
    }

    return {
        canRequestAds,
        isPersonalizationAllowed:
            isTrackingGranted && (await hasPersonalizationConsent(ads)),
        isPrivacyOptionsRequired,
    }
}

const requestConsentAndInitialize = async (): Promise<AdsConsentState> => {
    const ads = loadNativeAds()
    if (!ads) return NO_ADS

    await waitUntilActive()

    return toConsentState(ads, await gatherConsent(ads))
}

export const initializeAds = () => {
    // Ads are optional: if the consent status itself cannot be read, the
    // session runs without them rather than breaking the game.
    consentPromise ??= requestConsentAndInitialize().catch(() => NO_ADS)

    return consentPromise
}

export const showPrivacyOptions = async () => {
    const ads = loadNativeAds()
    if (!ads) throw new Error('Google Mobile Ads native module is unavailable')

    const consentInfo = await ads.AdsConsent.showPrivacyOptionsForm()
    consentPromise = toConsentState(ads, consentInfo)
    await consentPromise
}
