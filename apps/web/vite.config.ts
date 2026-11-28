/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { preloadGameChunk } from './preload-game-chunk'

export default defineConfig({
    plugins: [react(), tailwindcss(), preloadGameChunk()],
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    test: {
        deps: {
            optimizer: {
                client: {
                    enabled: true,
                    include: [
                        '@ctrl/react-adsense',
                        '@testing-library/react',
                        'lucide-react',
                        'react-intersection-observer',
                        'react-router',
                    ],
                },
            },
        },
        environment: 'jsdom',
        restoreMocks: true,
        setupFiles: ['./src/test-setup.ts'],
        unstubGlobals: true,
    },
})
