import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import type { AdsConsentInfo } from 'react-native-google-mobile-ads'

import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { AppState, Platform } from 'react-native'

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

let consentPromise: null | Promise<AdsConsentState> = null
let sdkStart: null | Promise<boolean> = null

export const getInterstitialAdUnitId = () =>
    __DEV__
        ? TEST_INTERSTITIAL_UNIT_ID
        : Platform.select({
              android: INTERSTITIAL_UNIT_IDS.android,
              default: INTERSTITIAL_UNIT_IDS.ios,
          })

const loadNativeAds = () => {
    try {
        return require('react-native-google-mobile-ads') as typeof GoogleMobileAds
    } catch {
        return null
    }
}

const waitUntilActive = () =>
    new Promise<void>(resolve => {
        if (AppState.currentState === 'active') {
            resolve()

            return
        }

        const subscription = AppState.addEventListener('change', state => {
            if (state === 'active') {
                subscription.remove()
                resolve()
            }
        })
    })

const gatherConsent = async ({ AdsConsent }: typeof GoogleMobileAds) => {
    try {
        await AdsConsent.gatherConsent()
    } catch {}

    return AdsConsent.getConsentInfo()
}

const requestTracking = async () => {
    try {
        const { granted } = await requestTrackingPermissionsAsync()

        return granted
    } catch {
        return false
    }
}

const hasPersonalizationConsent = async ({
    AdsConsent,
}: typeof GoogleMobileAds) => {
    try {
        if (!(await AdsConsent.getGdprApplies())) return true

        const { selectPersonalisedAds } = await AdsConsent.getUserChoices()

        return selectPersonalisedAds
    } catch {
        return false
    }
}

const startSdk = (ads: typeof GoogleMobileAds) => {
    sdkStart ??= (async () => {
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
