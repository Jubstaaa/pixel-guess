import { useEffect, useRef, useState } from 'react'

import { computeBlockSize, DIFFICULTY_CONFIG } from '@pixel-guess/shared'
import type { Difficulty } from '@pixel-guess/shared'

export const useCanvasPixelation = (
    imageUrl: string | null,
    count: number,
    difficulty: Difficulty
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
        img.crossOrigin = 'anonymous'

        // Sadece CORS sıkıntısı olan (Steam ve Flagcdn) resimleri proxy'den geçiriyoruz
        const needsProxy =
            imageUrl.includes('steamstatic.com') ||
            imageUrl.includes('flagcdn.com') ||
            imageUrl.includes('cloudfront.net') ||
            imageUrl.includes('image.tmdb.org') ||
            imageUrl.includes('logo.clearbit.com') ||
            imageUrl.includes('crests.football-data.org')

        let finalUrl = imageUrl
        if (needsProxy) {
            finalUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`
        }

        img.onload = () => {
            const maxSize = 400
            const aspect = img.width / img.height
            const width = aspect >= 1 ? maxSize : Math.round(maxSize * aspect)
            const height = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize

            canvas.width = width
            canvas.height = height

            const shortSide = Math.min(width, height)
            const blockSize = computeBlockSize(count, difficulty, shortSide)
            const { grayscale } = DIFFICULTY_CONFIG[difficulty]

            ctx.clearRect(0, 0, width, height)

            if (count === 6) {
                ctx.drawImage(img, 0, 0, width, height)
                if (grayscale) {
                    applyGrayscale(ctx, width, height)
                }
            } else {
                // Pikselleştirme işlemi
                // Önce resmi görünmez bir şekilde çizip veriyi alıyoruz
                ctx.drawImage(img, 0, 0, width, height)
                applyPixelation(ctx, width, height, blockSize, grayscale)
            }

            setIsImageLoaded(true)
        }

        img.onerror = () => {
            if (img.src !== imageUrl) {
                img.src = imageUrl
            } else {
                setIsImageLoaded(false)
            }
        }

        img.src = finalUrl
    }, [imageUrl, count, difficulty])

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
    // 1. Orijinal veriyi al
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    // 2. Canvas'ı temizle ki eski resim arkadan sızmasın
    ctx.clearRect(0, 0, width, height)

    // 3. Blok blok çiz
    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            // Blok içindeki piksellerin ortalamasını almak yerine
            // performans için bloğun merkezindeki pikseli alıyoruz
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
            // Bloğun tamamını boya
            ctx.fillRect(x, y, blockSize, blockSize)
        }
    }
}
