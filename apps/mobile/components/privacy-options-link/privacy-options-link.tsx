import { useCallback, useEffect, useState } from 'react'
import { Alert, Text, TouchableOpacity } from 'react-native'

import { initializeAds, showPrivacyOptions } from '@/lib/ads'

export const PrivacyOptionsLink = () => {
    const [isRequired, setIsRequired] = useState(false)

    useEffect(() => {
        let isMounted = true

        void initializeAds().then(consent => {
            if (isMounted) setIsRequired(consent.isPrivacyOptionsRequired)
        })

        return () => {
            isMounted = false
        }
    }, [])

    const handlePress = useCallback(() => {
        showPrivacyOptions().catch(() => {
            Alert.alert(
                'Privacy options unavailable',
                'Please try again later.'
            )
        })
    }, [])

    if (!isRequired) return null

    return (
        <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            className="mt-8 self-center px-4 py-3"
            onPress={handlePress}>
            <Text className="text-[13px] text-muted underline">
                Privacy options
            </Text>
        </TouchableOpacity>
    )
}
