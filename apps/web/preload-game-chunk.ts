import type { Plugin } from 'vite'

// The game route is lazy so home paints sooner. On a shared game link the
// router would only request it after the entry chunk has run; this starts that
// download alongside the entry instead. No plugin does a URL-conditional
// modulepreload, and Vite only knows the hashed file name after bundling.
const GAME_MODULE = /\/src\/pages\/game\/game\.tsx$/
const GAME_PATH = /^\/[^/]+\/(easy|hard)\/?$/

export const preloadGameChunk = (): Plugin => ({
    name: 'preload-game-chunk',
    apply: 'build',
    transformIndexHtml: {
        order: 'post',
        handler: (_html, { bundle }) => {
            const game = Object.values(bundle ?? {}).find(
                (output) =>
                    output.type === 'chunk' &&
                    GAME_MODULE.test(output.facadeModuleId ?? '')
            )
            if (!game) throw new Error('preload-game-chunk: no game chunk')

            const href = JSON.stringify(`/${game.fileName}`)
            return [
                {
                    tag: 'script',
                    injectTo: 'head-prepend',
                    children: `if (${GAME_PATH}.test(location.pathname)) { const link = document.createElement('link'); link.rel = 'modulepreload'; link.href = ${href}; document.head.append(link) }`,
                },
            ]
        },
    },
})
