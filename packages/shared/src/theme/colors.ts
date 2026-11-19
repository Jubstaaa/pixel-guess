export const COLORS = {
    background: '#000000',
    surface: '#18181b',
    surfaceHover: '#27272a',
    border: '#27272a',
    primary: '#006fee',
    primaryForeground: '#ffffff',
    foreground: '#ecedee',
    muted: '#71717a',
    warning: '#f5a524',
    success: '#17c964',
    danger: '#f31260',
} as const

export type ThemeColors = typeof COLORS
