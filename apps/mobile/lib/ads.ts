import { AppState } from 'react-native'

import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'

let consentPromise: Promise<boolean> | null = null

// ATTrackingManager silently ignores the request unless the app is already
// foregrounded, so asking straight from the root layout's effect can resolve to
// `notDetermined` without ever showing the system prompt.
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

const requestConsentAndInitialize = async () => {
    let isTrackingGranted = false

    try {
        await waitUntilActive()

        const { granted } = await requestTrackingPermissionsAsync()
        isTrackingGranted = granted
    } catch {
        // Tracking Transparency unavailable (Expo Go, simulator, older iOS)
    }

    try {
        const { default: mobileAds } = require('react-native-google-mobile-ads')
        await mobileAds().initialize()
    } catch {
        // Native module not available (Expo Go)
    }

    return isTrackingGranted
}

export const initializeAds = () => {
    consentPromise ??= requestConsentAndInitialize()

    return consentPromise
}
