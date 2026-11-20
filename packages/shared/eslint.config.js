import rootConfig from '../../eslint.config.js'

export default [
    ...rootConfig,
    {
        // The generator scripts have their own tsconfig (Bun types, no DOM),
        // which the project service would not pick up from their folder.
        files: ['scripts/**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: false,
                project: './tsconfig.scripts.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // bun:test types `expect(promise).resolves/rejects` matchers as
        // returning void, although they return a promise that must be awaited.
        files: ['**/*.test.ts'],
        rules: { '@typescript-eslint/await-thenable': 'off' },
    },
]
