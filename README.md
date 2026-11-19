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

## Dependency audit

CI runs `bun run audit` (`bun audit --audit-level=high`) and fails on any high or critical advisory, except these, which all sit in the **mobile** app's Expo toolchain and need an Expo SDK upgrade (`npx expo install --fix` and a new EAS build) rather than a lockfile bump:

| Advisory                                 | Package                | Comes from                                                               |
| ---------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849 | `postcss@8.4.49`       | `@expo/metro-config` (build time)                                        |
| GHSA-mrhx-c7xc-m3w5                      | `zod@3.25.76`          | `@expo/cli` (build time)                                                 |
| GHSA-5p2g-fcmc-qvqq, GHSA-w3rx-r6r6-pgpr | `image-size`           | `metro` (build time)                                                     |
| GHSA-qr28-fpjm-wq7f                      | `decode-uri-component` | `query-string` ← `@react-navigation/core` (deep-link parsing in the app) |

Remove them with the next Expo SDK upgrade.
