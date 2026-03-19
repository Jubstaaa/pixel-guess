# Pixel Guess Monorepo

A fun, image-guessing game built with **React (Web)** and **React Native (Expo)**, sharing a single logic package.

## Projects

- **`apps/web`**: React + Vite SPA
- **`apps/mobile`**: Expo + React Native app
- **`packages/shared`**: Shared logic, types, and data

## Tech Stack

- **Monorepo**: Turborepo + Bun Workspaces
- **Web**: React, Vite, Tailwind CSS v4
- **Mobile**: React Native, Expo, React Native Skia
- **Shared**: TypeScript

## Getting Started

1. **Install dependencies**:

    ```bash
    bun install
    ```

2. **Run web app**:

    ```bash
    bun run dev:web
    ```

3. **Run mobile app**:

    ```bash
    bun run dev:mobile
    ```

### Updating Game Data

To refresh character data and images from external APIs:

```bash
# Requires TMDB_API_KEY and FOOTBALL_DATA_API_KEY in packages/shared/.env
bun run generate
```

## Coding Standards

- **Kebab-case**: All files and folders
- **Flat Structure**: No nested subdirectories in feature folders
- **SSOT**: All game logic and data in `@pixel-guess/shared`
- **No Backend**: Fully client-side, images bundled at build time
