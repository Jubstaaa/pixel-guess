import { useCallback, useEffect, useRef } from 'react'

import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import type { InterstitialAd } from 'react-native-google-mobile-ads'

import { getInterstitialAdUnitId, initializeAds } from '@/lib/ads'

const MIN_INTERVAL = 4
const MAX_INTERVAL = 7

const getNextThreshold = () =>
    MIN_INTERVAL + Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1))

export const useInterstitialAd = () => {
    const correctCount = useRef(0)
    const nextShowAt = useRef(getNextThreshold())
    const adRef = useRef<InterstitialAd | null>(null)
    const isLoaded = useRef(false)
    const isPersonalizationAllowed = useRef(false)

    const loadAd = useCallback(() => {
        try {
            const { InterstitialAd, AdEventType } =
                require('react-native-google-mobile-ads') as typeof GoogleMobileAds

            const ad = InterstitialAd.createForAdRequest(
                getInterstitialAdUnitId(),
                {
                    requestNonPersonalizedAdsOnly:
                        !isPersonalizationAllowed.current,
                }
            )

            ad.addAdEventListener(AdEventType.LOADED, () => {
                isLoaded.current = true
            })

            ad.addAdEventListener(AdEventType.CLOSED, () => {
                isLoaded.current = false
                loadAd()
            })

            ad.load()
            adRef.current = ad
        } catch {
            // Native module not available (Expo Go)
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        void initializeAds().then((consent) => {
            if (!isMounted || !consent.canRequestAds) return

            isPersonalizationAllowed.current = consent.isPersonalizationAllowed
            loadAd()
        })

        return () => {
            isMounted = false
        }
    }, [loadAd])

    const onCorrectGuess = useCallback(() => {
        correctCount.current += 1

        if (correctCount.current >= nextShowAt.current && isLoaded.current) {
            // Since v17.2 show() rejects instead of throwing when the ad expired or
            // never finished loading; fetch a fresh one for the next threshold.
            adRef.current?.show().catch(() => {
                isLoaded.current = false
                loadAd()
            })
            correctCount.current = 0
            nextShowAt.current = getNextThreshold()
        }
    }, [loadAd])

    return { onCorrectGuess }
}
