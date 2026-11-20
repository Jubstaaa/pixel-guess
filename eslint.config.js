import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.expo/**',
            '**/.turbo/**',
            '**/babel.config.js',
            '**/metro.config.js',
            '**/eslint.config.{js,mjs}',
        ],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
            prettier: prettierPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            'prettier/prettier': 'error',
            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
        },
    }
)
