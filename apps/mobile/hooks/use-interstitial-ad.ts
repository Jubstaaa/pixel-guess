import { useCallback, useEffect, useRef } from 'react'

import {
    InterstitialAd,
    AdEventType,
    TestIds,
} from 'react-native-google-mobile-ads'

const AD_UNIT_ID = __DEV__
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-5250650495212334/6351511966'

const SHOW_EVERY_N = 3

export const useInterstitialAd = () => {
    const correctCount = useRef(0)
    const adRef = useRef<InterstitialAd | null>(null)
    const isLoaded = useRef(false)

    const loadAd = useCallback(() => {
        const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID)

        ad.addAdEventListener(AdEventType.LOADED, () => {
            isLoaded.current = true
        })

        ad.addAdEventListener(AdEventType.CLOSED, () => {
            isLoaded.current = false
            loadAd()
        })

        ad.load()
        adRef.current = ad
    }, [])

    useEffect(() => {
        loadAd()
    }, [loadAd])

    const onCorrectGuess = useCallback(() => {
        correctCount.current += 1

        if (correctCount.current % SHOW_EVERY_N === 0 && isLoaded.current) {
            adRef.current?.show()
        }
    }, [])

    return { onCorrectGuess }
}
