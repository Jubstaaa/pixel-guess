import '../global.css'

import React, { Fragment, useEffect } from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { COLORS } from '@/constants/colors'

const RootLayout = () => {
    useEffect(() => {
        try {
            const { default: mobileAds } = require('react-native-google-mobile-ads')
            mobileAds().initialize()
        } catch {
            // Native module not available (Expo Go)
        }
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
