import type * as GoogleMobileAds from 'react-native-google-mobile-ads'
import type { InterstitialAd } from 'react-native-google-mobile-ads'

import { useCallback, useEffect, useRef } from 'react'

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
    const requestAdRef = useRef<() => void>(() => undefined)

    const requestAd = useCallback(() => {
        const loadAd = async () => {
            adStatus.current = 'loading'

            const consent = await initializeAds()
            if (!isMounted.current || !consent.canRequestAds) {
                adRef.current = null
                adStatus.current = 'idle'

                return
            }

            const { AdEventType, InterstitialAd } =
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

            ad.addAdEventListener(AdEventType.ERROR, () => {
                adStatus.current = 'idle'
            })

            ad.addAdEventListener(AdEventType.CLOSED, () => {
                requestAdRef.current()
            })

            ad.load()
            adRef.current = ad
        }

        loadAd().catch(() => {
            adStatus.current = 'idle'
        })
    }, [])

    useEffect(() => {
        requestAdRef.current = requestAd
    }, [requestAd])

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

        adRef.current?.show().catch(() => {
            requestAd()
        })
        adStatus.current = 'idle'
        correctCount.current = 0
        nextShowAt.current = getNextThreshold()
    }, [requestAd])

    return { onCorrectGuess }
}
