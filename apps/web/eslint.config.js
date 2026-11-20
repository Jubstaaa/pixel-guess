import jsxA11y from 'eslint-plugin-jsx-a11y'

import rootConfig from '../../eslint.config.js'

export default [
    ...rootConfig,
    { files: ['**/*.tsx'], ...jsxA11y.flatConfigs.recommended },
]
