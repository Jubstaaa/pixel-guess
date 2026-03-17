import React, { useMemo } from 'react'

import {
    Canvas,
    ColorMatrix,
    Image,
    RuntimeShader,
    useImage,
} from '@shopify/react-native-skia'
import { ActivityIndicator, View } from 'react-native'

import { COLORS } from '@/constants/colors'
import {
    computeBlockSize,
    GRAYSCALE_MATRIX,
    usePixelateShader,
} from '@/hooks/use-skia-pixelation'

import type { PixelatedImageProps } from './pixelated-image.types'

export const PixelatedImage = ({
    imageUrl,
    count,
    levelType,
    size = 320,
}: PixelatedImageProps) => {
    const image = useImage(imageUrl)
    const shader = usePixelateShader()

    const { canvasWidth, canvasHeight } = useMemo(() => {
        if (!image) return { canvasWidth: size, canvasHeight: size }
        const aspect = image.width() / image.height()
        const w = aspect >= 1 ? size : Math.round(size * aspect)
        const h = aspect >= 1 ? Math.round(size / aspect) : size
        return { canvasWidth: w, canvasHeight: h }
    }, [image, size])

    const pixelSize = useMemo(
        () =>
            computeBlockSize(
                count,
                levelType,
                Math.min(canvasWidth, canvasHeight)
            ),
        [count, levelType, canvasWidth, canvasHeight]
    )

    const isFullyRevealed = count === 6

    if (!image) {
        return (
            <View
                style={{
                    height: size,
                    width: size,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: COLORS.surface,
                }}
            >
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        )
    }

    return (
        <Canvas style={{ height: canvasHeight, width: canvasWidth }}>
            <Image
                fit="fill"
                height={canvasHeight}
                image={image}
                width={canvasWidth}
                x={0}
                y={0}
            >
                {isFullyRevealed && levelType === 1 ? (
                    <ColorMatrix matrix={GRAYSCALE_MATRIX} />
                ) : !isFullyRevealed ? (
                    <RuntimeShader
                        source={shader}
                        uniforms={{
                            pixelSize,
                            grayscale: levelType === 1 ? 1.0 : 0.0,
                        }}
                    />
                ) : null}
            </Image>
        </Canvas>
    )
}
