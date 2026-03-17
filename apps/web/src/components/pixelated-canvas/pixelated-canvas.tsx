import { useCanvasPixelation } from '@/hooks/use-canvas-pixelation'

import type { PixelatedCanvasProps } from './pixelated-canvas.types'

export const PixelatedCanvas = ({
    imageUrl,
    count,
    difficulty,
}: PixelatedCanvasProps) => {
    const { canvasRef, isImageLoaded } = useCanvasPixelation(
        imageUrl,
        count,
        difficulty
    )

    return (
        <div className="relative">
            {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="h-full w-full"
                height={400}
                width={400}
                style={{
                    imageRendering: 'pixelated',
                    display: 'block',
                    opacity: isImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                }}
            />
        </div>
    )
}
