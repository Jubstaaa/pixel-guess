import confetti from 'canvas-confetti'

export const triggerConfetti = () => {
    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006fee', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'],
    })
}
