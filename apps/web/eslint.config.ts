import { react } from '@jubstaa/config/eslint/react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...react({ refresh: 'vite', tsconfigRootDir: import.meta.dirname }),
])
