import React from 'react'

import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

import { charactersByCategory } from '@pixel-guess/shared'

import { Game } from '../game/game'

import type { GameScreenProps } from './game-screen.types'

export const GameScreen = ({ levelType }: GameScreenProps) => {
    const { categorySlug } = useLocalSearchParams<{ categorySlug: string }>()

    if (!categorySlug || !charactersByCategory[categorySlug]) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-[16px] text-muted">
                    Category not found.
                </Text>
            </View>
        )
    }

    return <Game categorySlug={categorySlug} levelType={levelType} />
}
