import { useSyncExternalStore } from 'react'

const events = ['keydown', 'pointerdown', 'scroll', 'touchstart'] as const

let interacted = false
const listeners = new Set<() => void>()

const markInteracted = () => {
    interacted = true
    events.forEach(event => {
        window.removeEventListener(event, markInteracted)
    })
    listeners.forEach(listener => {
        listener()
    })
}

const subscribe = (listener: () => void) => {
    if (listeners.size === 0 && !interacted) {
        events.forEach(event => {
            window.addEventListener(event, markInteracted, { passive: true })
        })
    }
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export const useFirstInteraction = () =>
    useSyncExternalStore(subscribe, () => interacted)
