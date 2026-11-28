import type { Category } from '@pixel-guess/shared'

import { COLORS, getImageUrl } from '@pixel-guess/shared'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { Image } from '@/lib/image'

interface HeaderProps {
    category: Category
}

export const Header = ({ category }: HeaderProps) => {
    const router = useRouter()
    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    return (
        <View className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-3 py-3">
            <View className="flex-1 flex-row items-center gap-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="rounded-xl border border-border bg-surface-hover p-2"
                    onPress={handleBack}>
                    <ChevronLeft color={COLORS.foreground} size={18} />
                </TouchableOpacity>
                <View className="rounded-xl bg-primary/10 p-2">
                    <Image
                        contentFit="contain"
                        source={getImageUrl(category.icon)}
                        style={{ height: 22, width: 22 }}
                    />
                </View>
                <Text
                    className="flex-1 text-[14px] font-semibold text-foreground"
                    numberOfLines={1}>
                    {category.name}
                </Text>
            </View>
        </View>
    )
}
