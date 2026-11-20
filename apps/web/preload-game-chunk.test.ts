import { runInNewContext } from 'node:vm'

import type { IndexHtmlTransformContext } from 'vite'
import { describe, expect, test } from 'vitest'

import { preloadGameChunk } from './preload-game-chunk'

const transform = (bundle: IndexHtmlTransformContext['bundle']) => {
    const { transformIndexHtml } = preloadGameChunk()
    if (typeof transformIndexHtml !== 'object')
        throw new Error('expected an ordered hook')
    return transformIndexHtml.handler.call({} as never, '<html></html>', {
        bundle,
        filename: 'index.html',
        path: '/index.html',
    })
}

const chunk = (fileName: string, facadeModuleId: string) =>
    ({ facadeModuleId, fileName, type: 'chunk' }) as never

describe('preloadGameChunk', () => {
    test('preloads the game chunk only on game URLs', () => {
        const tags = transform({
            'assets/game-abc.js': chunk(
                'assets/game-abc.js',
                '/repo/apps/web/src/pages/game/game.tsx'
            ),
        }) as { children: string; tag: string }[]

        expect(tags).toHaveLength(1)
        const script = tags[0].children
        expect(script).toContain('/assets/game-abc.js')

        const run = (pathname: string) => {
            const added: { href: string; rel: string }[] = []
            runInNewContext(script, {
                document: {
                    createElement: () => ({}),
                    head: { append: (l: never) => added.push(l) },
                },
                location: { pathname },
            })
            return added
        }
        expect(run('/pokemon/easy')).toEqual([
            { href: '/assets/game-abc.js', rel: 'modulepreload' },
        ])
        expect(run('/pokemon/hard/')).toHaveLength(1)
        expect(run('/')).toEqual([])
        expect(run('/about')).toEqual([])
    })

    test('fails the build when the game chunk is missing', () => {
        expect(() => transform({})).toThrow(/game chunk/)
    })
})
