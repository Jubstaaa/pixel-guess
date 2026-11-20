import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

import {
    computeBlockSize,
    DIFFICULTY_CONFIG,
    getImageUrl,
    MAX_COUNT,
} from '@pixel-guess/shared'
import type { Difficulty, ImageType } from '@pixel-guess/shared'

interface DecodedImage {
    url: string
    image: HTMLImageElement
}

export const useCanvasPixelation = (
    imageUrl: string | null,
    count: number,
    difficulty: Difficulty,
    imageType: ImageType = 'character'
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [decoded, setDecoded] = useState<DecodedImage | null>(null)
    const [failedUrl, setFailedUrl] = useState<string | null>(null)
    const [loadAttempt, setLoadAttempt] = useState(0)

    // Loading depends on the URL only: each wrong guess redraws the image
    // that is already decoded instead of fetching and decoding it again.
    useEffect(() => {
        if (!imageUrl) return

        // A newer image supersedes this one; its late load must not replace
        // what is on screen now.
        let isStale = false
        const img = new Image()
        // The images are served from the CDN, so every one of them is
        // cross-origin. Without this the canvas is tainted and the getImageData
        // calls below throw a SecurityError, which breaks the whole game rather
        // than just one frame. Requires the bucket to send an
        // Access-Control-Allow-Origin header, which it does.
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            if (!isStale) setDecoded({ image: img, url: imageUrl })
        }
        img.onerror = () => {
            if (!isStale) setFailedUrl(imageUrl)
        }
        img.src = getImageUrl(imageUrl)

        return () => {
            isStale = true
        }
    }, [imageUrl, loadAttempt])

    const current = decoded && decoded.url === imageUrl ? decoded : null

    // A layout effect, so the previous image never shows for a frame once the
    // new one is marked as loaded.
    useLayoutEffect(() => {
        const canvas = canvasRef.current
        if (!current || !canvas) return

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        const { image, url } = current
        if (!ctx || !image.width || !image.height) {
            setFailedUrl(url)
            return
        }

        try {
            drawRound(canvas, ctx, image, count, difficulty, imageType)
        } catch (error) {
            // A tainted canvas or an image the browser cannot read is one
            // broken round, not a reason to take the whole page down.
            if (!(error instanceof DOMException)) throw error
            setFailedUrl(url)
        }
    }, [current, count, difficulty, imageType])

    const retry = useCallback(() => {
        setFailedUrl(null)
        setLoadAttempt((attempt) => attempt + 1)
    }, [])

    const hasError = imageUrl !== null && failedUrl === imageUrl

    return {
        canvasRef,
        hasError,
        isImageLoaded: current !== null && !hasError,
        retry,
    }
}

const drawRound = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    count: number,
    difficulty: Difficulty,
    imageType: ImageType
) => {
    const maxSize = 400
    const aspect = image.width / image.height
    const width = aspect >= 1 ? maxSize : Math.round(maxSize * aspect)
    const height = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize

    canvas.width = width
    canvas.height = height

    const { grayscale } = DIFFICULTY_CONFIG[difficulty]

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)

    if (count === MAX_COUNT) {
        if (grayscale) applyGrayscale(ctx, width, height)
        return
    }
    const blockSize = computeBlockSize(
        count,
        difficulty,
        Math.min(width, height),
        imageType
    )
    applyPixelation(ctx, width, height, blockSize, grayscale)
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
                b = data[i + 2]
            const a = data[i + 3]

            if (grayscale) {
                const avg = (r + g + b) / 3
                r = g = b = avg
            }

            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
            ctx.fillRect(x, y, blockSize, blockSize)
        }
    }
}
