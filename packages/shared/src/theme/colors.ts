export const COLORS = {
    background: '#000000',
    border: '#222222',
    danger: '#f31260',
    foreground: '#ffffff',
    muted: '#888888',
    mutedForeground: '#666666',
    primary: '#f59e0b',
    primaryForeground: '#ffffff',
    success: '#17c964',
    surface: '#111111',
    surfaceHover: '#1a1a1a',
    warning: '#f5a524',
} as const

export type ThemeColors = typeof COLORS
