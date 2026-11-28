import type { Plugin } from 'vite'

const GAME_PATH = /^\/[^/]+\/(easy|hard)\/?$/

export const preloadGameChunk = (): Plugin => ({
    apply: 'build',
    name: 'preload-game-chunk',
    transformIndexHtml: {
        handler: (_html, { bundle }) => {
            const game = Object.values(bundle ?? {}).find(
                output =>
                    output.type === 'chunk' &&
                    (output.facadeModuleId ?? '').endsWith(
                        '/src/pages/game/game.tsx'
                    )
            )
            if (!game) throw new Error('preload-game-chunk: no game chunk')

            const href = JSON.stringify(`/${game.fileName}`)
            return [
                {
                    children: `if (${GAME_PATH}.test(location.pathname)) { const link = document.createElement('link'); link.rel = 'modulepreload'; link.href = ${href}; document.head.append(link) }`,
                    injectTo: 'head',
                    tag: 'script',
                },
            ]
        },
        order: 'post',
    },
})
