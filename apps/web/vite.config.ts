/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        // The hoisted install puts the mobile app's React (pinned by its Expo SDK)
        // at the root, so a dependency such as react-helmet-async gets its own
        // nested copy; two Reacts in one bundle break every hook.
        dedupe: ['react', 'react-dom'],
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        restoreMocks: true,
        // Vitest hands node_modules to Node's resolver, which gives root-level
        // packages (Testing Library, React Router, Lucide) the mobile app's React. The
        // optimizer bundles them through Vite instead, so `dedupe` applies.
        deps: {
            optimizer: {
                client: {
                    enabled: true,
                    include: [
                        '@testing-library/react',
                        'lucide-react',
                        'react-router',
                    ],
                },
            },
        },
    },
})
