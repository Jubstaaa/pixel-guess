import { useCallback, useSyncExternalStore } from 'react'

// matchMedia plus useSyncExternalStore is the platform's own answer; the hook
// libraries that wrap it (usehooks-ts, react-responsive, @uidotdev/usehooks)
// have had no release in over a year. Reading it during render keeps the
// first paint on the right layout, so nothing shifts once mounted.
export const useMediaQuery = (query: string) => {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const list = window.matchMedia(query)
            list.addEventListener('change', onChange)
            return () => list.removeEventListener('change', onChange)
        },
        [query]
    )
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches
    )
}
