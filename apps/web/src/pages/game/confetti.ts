import confetti from 'canvas-confetti'

import { COLORS } from '@pixel-guess/shared'

export const triggerConfetti = () => {
    // Purely decorative: nothing waits for the animation to finish.
    void confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: [COLORS.primary, '#a855f7', '#10b981', '#f43f5e'],
    })
}
