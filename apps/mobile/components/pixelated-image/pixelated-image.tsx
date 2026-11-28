import type { ImageType } from '@pixel-guess/shared'

import { COLORS } from '@pixel-guess/shared'
import {
    Canvas,
    ColorMatrix,
    Image,
    RuntimeShader,
    useImage,
} from '@shopify/react-native-skia'
import { useMemo } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useCachedImageUri } from './use-cached-image'
import {
    computeBlockSize,
    GRAYSCALE_MATRIX,
    usePixelateShader,
} from './use-skia-pixelation'

interface PixelatedImageProps {
    count: number
    imageType?: ImageType | undefined
    imageUrl: string
    levelType: number
    size?: number
}

export const PixelatedImage = ({
    count,
    imageType = 'character',
    imageUrl,
    levelType,
    size = 320,
}: PixelatedImageProps) => {
    const source = useCachedImageUri(imageUrl)
    const image = useImage(source)
    const shader = usePixelateShader()

    const { canvasHeight, canvasWidth } = useMemo(() => {
        if (!image) return { canvasHeight: size, canvasWidth: size }
        const aspect = image.width() / image.height()
        const w = aspect >= 1 ? size : Math.round(size * aspect)
        const h = aspect >= 1 ? Math.round(size / aspect) : size
        return { canvasHeight: h, canvasWidth: w }
    }, [image, size])

    const pixelSize = useMemo(
        () =>
            computeBlockSize(
                count,
                levelType,
                Math.min(canvasWidth, canvasHeight),
                imageType
            ),
        [count, levelType, canvasWidth, canvasHeight, imageType]
    )

    const isFullyRevealed = count === 6

    if (!image) {
        return (
            <View
                style={{
                    alignItems: 'center',
                    backgroundColor: COLORS.surface,
                    borderRadius: 12,
                    height: size,
                    justifyContent: 'center',
                    width: size,
                }}>
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
                y={0}>
                {isFullyRevealed && levelType === 1 ? (
                    <ColorMatrix matrix={GRAYSCALE_MATRIX} />
                ) : !isFullyRevealed ? (
                    <RuntimeShader
                        source={shader}
                        uniforms={{
                            grayscale: levelType === 1 ? 1.0 : 0.0,
                            pixelSize,
                        }}
                    />
                ) : null}
            </Image>
        </Canvas>
    )
}
