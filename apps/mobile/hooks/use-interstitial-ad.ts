import { useCallback, useEffect, useRef } from 'react'

const AD_UNIT_ID = __DEV__
    ? 'ca-app-pub-3940256099942544/4411468910'
    : 'ca-app-pub-5250650495212334/6351511966'

const SHOW_EVERY_N = 3

export const useInterstitialAd = () => {
    const correctCount = useRef(0)
    const adRef = useRef<any>(null)
    const isLoaded = useRef(false)

    const loadAd = useCallback(() => {
        try {
            const {
                InterstitialAd,
                AdEventType,
            } = require('react-native-google-mobile-ads')

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
        } catch {
            // Native module not available (Expo Go)
        }
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
