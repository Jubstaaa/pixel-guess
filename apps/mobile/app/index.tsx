import React from 'react'

import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { categories } from '@pixel-guess/shared'

import { CategoryCard } from '@/components/category-card/category-card'
import { Image } from '@/lib/image'

const HomeScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <ScrollView
                className="px-4"
                contentContainerClassName="pb-10"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center pt-12 pb-10">
                    <Image
                        className="mb-6"
                        contentFit="cover"
                        source={require('../assets/icon.png')}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 22,
                            shadowColor: '#f59e0b',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                        }}
                    />
                    <Text className="text-[48px] font-[900] tracking-[-2px] text-foreground">
                        Pixel
                        <Text className="text-primary"> Guess</Text>
                    </Text>
                    <Text className="mt-2 max-w-[280px] text-center text-[14px] leading-[21px] text-muted">
                        Pick a category and guess the hidden character pixel by
                        pixel.
                    </Text>
                </View>

                <View className="gap-3">
                    {categories.map((item) => (
                        <CategoryCard key={item.slug} item={item} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen
