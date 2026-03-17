import React, { useMemo } from 'react'

import { Slot, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Header } from '@/components/header/header'
import { COLORS } from '@/constants/colors'
import { categories } from '@pixel-guess/shared'

const CategoryLayout = () => {
    const { categorySlug } = useLocalSearchParams<{ categorySlug: string }>()

    const category = useMemo(
        () => categories.find((c) => c.slug === categorySlug) ?? null,
        [categorySlug]
    )

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <View className="flex-1 gap-3 px-3 pt-2">
                {category ? (
                    <Header category={category} />
                ) : (
                    <View className="h-14 items-center justify-center">
                        <ActivityIndicator color={COLORS.primary} />
                    </View>
                )}
                <Slot />
            </View>
        </SafeAreaView>
    )
}

export default CategoryLayout
