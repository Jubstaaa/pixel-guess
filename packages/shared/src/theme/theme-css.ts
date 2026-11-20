const toCssVariable = (name: string) =>
    `--color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`

export const renderThemeCss = (colors: Readonly<Record<string, string>>) =>
    [
        '/* Generated from src/theme/colors.ts by `bun run generate:theme`. */',
        '@theme {',
        ...Object.entries(colors).map(
            ([name, value]) => `    ${toCssVariable(name)}: ${value};`
        ),
        '}',
        '',
    ].join('\n')
