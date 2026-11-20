import { COLORS } from '../src/theme/colors'
import { renderThemeCss } from '../src/theme/theme-css'

await Bun.write(
    new URL('../src/styles/theme.css', import.meta.url),
    renderThemeCss(COLORS)
)
