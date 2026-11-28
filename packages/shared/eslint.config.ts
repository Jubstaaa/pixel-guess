import { library } from '@jubstaa/config/eslint/library'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...library({ tsconfigRootDir: import.meta.dirname }),
])
