import { describe, expect, test } from 'bun:test'

import { COLORS } from './colors'
import { renderThemeCss } from './theme-css'

const committedCss = () =>
    Bun.file(new URL('../styles/theme.css', import.meta.url)).text()

describe('theme.css', () => {
    test('maps each colour to a Tailwind theme variable', () => {
        expect(
            renderThemeCss({ primary: '#f59e0b', surfaceHover: '#1a1a1a' })
        ).toContain('--color-surface-hover: #1a1a1a;')
    })

    // Web and the mobile class names read theme.css, mobile inline styles
    // read COLORS: one palette only if the file is generated from COLORS.
    test('is generated from COLORS (run `bun run generate:theme`)', async () => {
        expect(await committedCss()).toBe(renderThemeCss(COLORS))
    })
})
