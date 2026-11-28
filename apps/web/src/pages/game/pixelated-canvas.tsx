import type { Difficulty, ImageType } from '@pixel-guess/shared'

import { useCanvasPixelation } from './use-canvas-pixelation'

const FRAME_ASPECT: Record<ImageType, string> = {
    character: 'aspect-square',
    logo: 'aspect-square',
    poster: 'aspect-[2/3]',
}

interface PixelatedCanvasProps {
    count: number
    difficulty: Difficulty
    imageType?: ImageType
    imageUrl: null | string
}

export const PixelatedCanvas = ({
    count,
    difficulty,
    imageType = 'character',
    imageUrl,
}: PixelatedCanvasProps) => {
    const { canvasRef, hasError, isImageLoaded, retry } = useCanvasPixelation(
        imageUrl,
        count,
        difficulty,
        imageType
    )

    return (
        <div className={`relative ${FRAME_ASPECT[imageType]}`}>
            {hasError ? (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center"
                    role="alert">
                    <p className="text-sm text-muted">
                        This image could not be loaded.
                    </p>
                    <button
                        className="rounded-xl border border-border bg-surface-hover px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
                        onClick={retry}
                        type="button">
                        Retry
                    </button>
                </div>
            ) : (
                !isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                )
            )}
            <canvas
                className="h-full w-full object-contain"
                height={400}
                ref={canvasRef}
                style={{
                    display: 'block',
                    imageRendering: 'pixelated',
                    opacity: isImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                }}
                width={400}
            />
        </div>
    )
}
