import { getImageUrl } from '@pixel-guess/shared'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'

const toFileUri = (path: string) =>
    path.startsWith('file://') ? path : `file://${path}`

export const useCachedImageUri = (key: null | string) => {
    const [resolved, setResolved] = useState<null | {
        key: string
        uri: string
    }>(null)

    useEffect(() => {
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

                if (!cancelled)
                    setResolved({ key, uri: path ? toFileUri(path) : url })
            } catch {
                if (!cancelled) setResolved({ key, uri: url })
            }
        }

        void resolve()

        return () => {
            cancelled = true
        }
    }, [key])

    return resolved?.key === key ? resolved.uri : null
}
