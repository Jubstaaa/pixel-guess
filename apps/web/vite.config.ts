import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        // The hoisted install puts the mobile app's React (pinned by its Expo SDK)
        // at the root, so a dependency such as react-helmet-async gets its own
        // nested copy; two Reacts in one bundle break every hook.
        dedupe: ['react', 'react-dom'],
    },
})
