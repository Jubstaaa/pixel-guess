import { useMemo } from 'react'

import { Skia } from '@shopify/react-native-skia'

import { computeBlockSize as sharedComputeBlockSize } from '@pixel-guess/shared'

const PIXELATE_SHADER_SRC = `
  uniform shader image;
  uniform float pixelSize;
  uniform float grayscale;

  half4 main(float2 xy) {
    float2 snapped = floor(xy / pixelSize) * pixelSize + pixelSize * 0.5;
    half4 color = image.eval(snapped);
    if (grayscale > 0.5) {
      float avg = dot(color.rgb, half3(0.333, 0.333, 0.333));
      return half4(avg, avg, avg, color.a);
    }
    return color;
  }
`

export const GRAYSCALE_MATRIX = [
    0.333, 0.333, 0.333, 0, 0, 0.333, 0.333, 0.333, 0, 0, 0.333, 0.333, 0.333,
    0, 0, 0, 0, 0, 1, 0,
]

export const computeBlockSize = (
    count: number,
    levelType: number,
    size: number = 400
): number =>
    sharedComputeBlockSize(count, levelType === 1 ? 'hard' : 'easy', size)

export const usePixelateShader = () =>
    useMemo(() => {
        const effect = Skia.RuntimeEffect.Make(PIXELATE_SHADER_SRC)
        if (!effect) throw new Error('Failed to compile pixelation shader')
        return effect
    }, [])
