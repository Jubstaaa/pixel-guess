import { react } from '@jubstaa/config/eslint/react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...react({ refresh: undefined }),
    {
        files: ['**/*.{ts,tsx}'],
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
])
