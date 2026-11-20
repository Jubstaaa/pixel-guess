// The one palette for both apps: src/styles/theme.css is generated from it.
export const COLORS = {
    primary: '#f59e0b',
    primaryForeground: '#ffffff',
    background: '#000000',
    foreground: '#ffffff',
    surface: '#111111',
    surfaceHover: '#1a1a1a',
    border: '#222222',
    muted: '#888888',
    mutedForeground: '#666666',
    warning: '#f5a524',
    success: '#17c964',
    danger: '#f31260',
} as const

export type ThemeColors = typeof COLORS
