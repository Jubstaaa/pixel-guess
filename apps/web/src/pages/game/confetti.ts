import { COLORS } from '@pixel-guess/shared'
import confetti from 'canvas-confetti'

export const triggerConfetti = () => {
    void confetti({
        colors: [COLORS.primary, '#a855f7', '#10b981', '#f43f5e'],
        origin: { y: 0.6 },
        particleCount: 120,
        spread: 70,
    })
}
