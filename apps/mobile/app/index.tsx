import { categories } from '@pixel-guess/shared'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CategoryCard } from '@/components/category-card/category-card'
import { PrivacyOptionsLink } from '@/components/privacy-options-link/privacy-options-link'
import { Image } from '@/lib/image'

const appIcon = require('../assets/icon.png') as number

const HomeScreen = () => {
    return (
        <SafeAreaView style={{ backgroundColor: '#000000', flex: 1 }}>
            <ScrollView
                className="px-4"
                contentContainerClassName="pb-10"
                showsVerticalScrollIndicator={false}>
                <View className="items-center pt-12 pb-10">
                    <Image
                        className="mb-6"
                        contentFit="cover"
                        source={appIcon}
                        style={{
                            borderRadius: 22,
                            height: 80,
                            shadowColor: '#f59e0b',
                            shadowOffset: { height: 0, width: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                            width: 80,
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
                    {categories.map(item => (
                        <CategoryCard item={item} key={item.slug} />
                    ))}
                </View>

                <PrivacyOptionsLink />
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen
