import '../global.css'

import React, { Fragment, useEffect } from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import mobileAds from 'react-native-google-mobile-ads'

import { COLORS } from '@/constants/colors'

const RootLayout = () => {
    useEffect(() => {
        mobileAds().initialize()
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
