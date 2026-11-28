import type { Category } from '@pixel-guess/shared'

import { getImageUrl } from '@pixel-guess/shared'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { Image } from '@/lib/image'

interface CategoryCardProps {
    item: Category
}

export const CategoryCard = ({ item }: CategoryCardProps) => {
    const router = useRouter()

    const handleEasyPress = useCallback(() => {
        router.push({
            params: { categorySlug: item.slug },
            pathname: '/[categorySlug]/easy',
        })
    }, [router, item.slug])

    const handleHardPress = useCallback(() => {
        router.push({
            params: { categorySlug: item.slug },
            pathname: '/[categorySlug]/hard',
        })
    }, [router, item.slug])

    return (
        <View className="overflow-hidden rounded-2xl border border-border bg-surface">
            <View className="flex-row items-center gap-4 px-4 py-4">
                <View className="rounded-xl bg-primary/10 p-3">
                    <Image
                        contentFit="contain"
                        source={getImageUrl(item.icon)}
                        style={{ borderRadius: 8, height: 44, width: 44 }}
                    />
                </View>
                <View className="flex-1 gap-2.5">
                    <Text className="text-[17px] font-bold text-foreground">
                        {item.name}
                    </Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            className="rounded-lg border border-success/25 bg-success/10 px-4 py-1.5"
                            onPress={handleEasyPress}>
                            <Text className="text-[12px] font-semibold text-success">
                                Easy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-1.5"
                            onPress={handleHardPress}>
                            <Text className="text-[12px] font-semibold text-warning">
                                Hard
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}
