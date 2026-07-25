import { useEffect, useState } from 'react'

import { getImageUrl } from '@pixel-guess/shared'
import { Image } from 'expo-image'

const toFileUri = (path: string) =>
    path.startsWith('file://') ? path : `file://${path}`

/**
 * Resolves an image key to something Skia can draw, preferring a local copy.
 *
 * Skia's `useImage` accepts a remote URL but keeps no persistent cache, so it
 * would re-download the same character every round. expo-image already
 * maintains a disk cache — and the search list renders the very same URLs
 * through it — so this warms that cache and hands Skia the file on disk.
 *
 * Falls back to the remote URL whenever the cache cannot be consulted: a slower
 * image beats a blank canvas.
 */
export const useCachedImageUri = (key: string | null) => {
    const [uri, setUri] = useState<string | null>(null)

    useEffect(() => {
        setUri(null)

        if (!key) return

        let cancelled = false
        const url = getImageUrl(key)

        const resolve = async () => {
            try {
                let path = await Image.getCachePathAsync(url)

                if (!path) {
                    await Image.prefetch(url, 'disk')
                    path = await Image.getCachePathAsync(url)
                }

                if (!cancelled) setUri(path ? toFileUri(path) : url)
            } catch {
                if (!cancelled) setUri(url)
            }
        }

        void resolve()

        return () => {
            cancelled = true
        }
    }, [key])

    return uri
}
