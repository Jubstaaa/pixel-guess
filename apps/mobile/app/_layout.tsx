import '../global.css'

import { COLORS } from '@pixel-guess/shared'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Fragment, useEffect } from 'react'

import { initializeAds } from '@/lib/ads'

const RootLayout = () => {
    useEffect(() => {
        void initializeAds()
    }, [])

    return (
        <Fragment>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: COLORS.background },
                    headerShown: false,
                }}
            />
        </Fragment>
    )
}

export default RootLayout
