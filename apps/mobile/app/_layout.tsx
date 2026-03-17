import '../global.css'

import React, { Fragment } from 'react'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { COLORS } from '@/constants/colors'

const RootLayout = () => (
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

export default RootLayout
