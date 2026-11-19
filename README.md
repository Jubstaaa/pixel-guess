# Pixel Guess Monorepo

A fun, image-guessing game built with **React (Web)** and **React Native (Expo)**, sharing a single logic package.

## Projects

- **`apps/web`**: React + Vite SPA, served as static files at [pixelguessgame.com](https://pixelguessgame.com)
- **`apps/mobile`**: Expo + React Native app (iOS, released through EAS)
- **`packages/shared`**: Game logic, types, theme and the generated character data both apps use

## Tech Stack

- **Monorepo**: Turborepo + Bun Workspaces
- **Web**: React, React Router, Vite, Tailwind CSS v4
- **Mobile**: React Native, Expo, React Native Skia
- **Shared**: TypeScript, consumed as source (no build step)
- **Images**: the `pixelguess` DigitalOcean Space, served from its CDN

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

## Checks

```bash
bun run format:check
bun run lint
bun run type-check
bun run test     # bun test in packages/shared, Vitest in apps/web
bun run build --filter=@pixel-guess/web
```

CI runs all of these in the `check` job, which every pull request needs green before it can merge.

## Layout

Code lives next to the only place that uses it.

- `packages/shared/src`: `game/` (rules, search, pixelation maths, config), `cdn/` (image URLs), `theme/`, `types.ts`, and `data/` (generated, do not edit by hand). `index.ts` is the package's public API.
- `apps/web/src`: `pages/<route>` holds each route with the components and hooks only it uses (`pages/game/`, `pages/home/`), and `layout/` holds the site-wide footer.

## Game Data and Images

Character data and images come from external APIs:

```bash
# Requires TMDB_API_KEY and FOOTBALL_DATA_API_KEY in packages/shared/.env
bun run generate
```

`generate` rewrites `packages/shared/src/data` and writes resized WebP images to the git-ignored `packages/shared/assets/images`. Neither app bundles the images. Both load them from the Space's CDN (`IMAGE_CDN_BASE_URL` in `packages/shared/src/cdn/image-url.ts`). To publish new images, run:

```bash
# Requires S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY
bun run --filter=@pixel-guess/shared sync:images            # add --dry-run to preview
```

Deletions only happen with `--prune`, because store versions that are already published keep requesting the old keys.

## Deployment

Pushes to `main` that touch the web app or the shared package run `deploy-web.yml`. It first runs the full CI check, then builds `apps/web/dist` and releases it atomically to the droplet's static `pixelguess` site behind Caddy and Cloudflare. If the site doesn't answer afterwards, the deploy switches back to the previous release. The mobile app ships separately through EAS.

## Dependency audit

CI runs `bun run audit` (`bun audit --audit-level=high`) and fails on any high or critical advisory. No advisories are ignored.

## Upgrading Expo

Upgrade one SDK at a time, from `apps/mobile`:

```bash
bunx expo install expo@^<N>.0.0 --fix
bunx expo-doctor
bunx expo export --platform ios --platform android --platform web
```

Then read that SDK's changelog for breaking changes. The workspace installs with Bun's hoisted linker (`bunfig.toml`): the isolated linker installs the Expo packages that peer on each other more than once, and expo-doctor rejects duplicate native modules.
