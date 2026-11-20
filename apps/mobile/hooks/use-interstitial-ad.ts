import { useCallback, useEffect, useRef } from 'react'

import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import type { InterstitialAd } from 'react-native-google-mobile-ads'

import { getInterstitialAdUnitId, initializeAds } from '@/lib/ads'

const MIN_INTERVAL = 4
const MAX_INTERVAL = 7

const getNextThreshold = () =>
    MIN_INTERVAL + Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1))

type AdStatus = 'idle' | 'loaded' | 'loading'

export const useInterstitialAd = () => {
    const correctCount = useRef(0)
    const nextShowAt = useRef(getNextThreshold())
    const adRef = useRef<InterstitialAd | null>(null)
    const adStatus = useRef<AdStatus>('idle')
    const isMounted = useRef(false)

    const requestAd = useCallback(() => {
        const loadAd = async () => {
            adStatus.current = 'loading'

            // Read consent per request: the privacy options form can change it
            // between two ads.
            const consent = await initializeAds()
            if (!isMounted.current || !consent.canRequestAds) {
                adRef.current = null
                adStatus.current = 'idle'

                return
            }

            const { InterstitialAd, AdEventType } =
                require('react-native-google-mobile-ads') as typeof GoogleMobileAds

            const ad = InterstitialAd.createForAdRequest(
                getInterstitialAdUnitId(),
                {
                    requestNonPersonalizedAdsOnly:
                        !consent.isPersonalizationAllowed,
                }
            )

            ad.addAdEventListener(AdEventType.LOADED, () => {
                adStatus.current = 'loaded'
            })

            // No fill or a network error: retried when the next ad is due.
            ad.addAdEventListener(AdEventType.ERROR, () => {
                adStatus.current = 'idle'
            })

            ad.addAdEventListener(AdEventType.CLOSED, () => {
                requestAd()
            })

            ad.load()
            adRef.current = ad
        }

        loadAd().catch(() => {
            // Ads are optional; a failed request is retried when the next ad is due.
            adStatus.current = 'idle'
        })
    }, [])

    useEffect(() => {
        isMounted.current = true
        requestAd()

        return () => {
            isMounted.current = false
        }
    }, [requestAd])

    const onCorrectGuess = useCallback(() => {
        correctCount.current += 1

        if (correctCount.current < nextShowAt.current) return

        if (adStatus.current === 'idle') {
            requestAd()

            return
        }

        if (adStatus.current !== 'loaded') return

        // Since v17.2 show() rejects instead of throwing when the ad expired or
        // never finished loading; fetch a fresh one for the next threshold.
        adRef.current?.show().catch(() => {
            requestAd()
        })
        adStatus.current = 'idle'
        correctCount.current = 0
        nextShowAt.current = getNextThreshold()
    }, [requestAd])

    return { onCorrectGuess }
}
