import '../global.css'

import React, { Fragment, useEffect } from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { COLORS } from '@/constants/colors'
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
