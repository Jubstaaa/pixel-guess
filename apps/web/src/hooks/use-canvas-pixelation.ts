import { useEffect, useRef, useState } from 'react'

import { computeBlockSize, DIFFICULTY_CONFIG } from '@pixel-guess/shared'
import type { Difficulty, ImageType } from '@pixel-guess/shared'

import { getImageUrl } from '@/lib/image-url'

export const useCanvasPixelation = (
    imageUrl: string | null,
    count: number,
    difficulty: Difficulty,
    imageType: ImageType = 'character'
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    useEffect(() => {
        if (!imageUrl) {
            setIsImageLoaded(false)
            return
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const img = new Image()
        const finalUrl = getImageUrl(imageUrl)

        img.onload = () => {
            const maxSize = 400
            const aspect = img.width / img.height
            const width = aspect >= 1 ? maxSize : Math.round(maxSize * aspect)
            const height = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize

            canvas.width = width
            canvas.height = height

            const shortSide = Math.min(width, height)
            const blockSize = computeBlockSize(count, difficulty, shortSide, imageType)
            const { grayscale } = DIFFICULTY_CONFIG[difficulty]

            ctx.clearRect(0, 0, width, height)

            if (count === 6) {
                ctx.drawImage(img, 0, 0, width, height)
                if (grayscale) {
                    applyGrayscale(ctx, width, height)
                }
            } else {
                ctx.drawImage(img, 0, 0, width, height)
                applyPixelation(ctx, width, height, blockSize, grayscale)
            }

            setIsImageLoaded(true)
        }

        img.onerror = () => {
            setIsImageLoaded(false)
        }

        img.src = finalUrl
    }, [imageUrl, count, difficulty, imageType])

    return { canvasRef, isImageLoaded }
}

const applyGrayscale = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = data[i + 1] = data[i + 2] = avg
    }
    ctx.putImageData(imageData, 0, 0)
}

const applyPixelation = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    blockSize: number,
    grayscale: boolean
) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    ctx.clearRect(0, 0, width, height)

    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            const centerX = Math.min(x + Math.floor(blockSize / 2), width - 1)
            const centerY = Math.min(y + Math.floor(blockSize / 2), height - 1)
            const i = (centerY * width + centerX) * 4

            let r = data[i],
                g = data[i + 1],
                b = data[i + 2],
                a = data[i + 3]

            if (grayscale) {
                const avg = (r + g + b) / 3
                r = g = b = avg
            }

            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
            ctx.fillRect(x, y, blockSize, blockSize)
        }
    }
}
