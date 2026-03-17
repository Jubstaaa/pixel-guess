# Pixel Guess Monorepo

Welcome to the **Pixel Guess** monorepo! This project is a fun, image-guessing game built with **React (Web)** and **React Native (Expo)**, all sharing a single logic package.

## 🚀 Projects

- **`apps/web`**: A React + Vite SPA for the web.
- **`apps/mobile`**: An Expo + React Native app for mobile devices.
- **`packages/shared`**: Shared logic, types, and data used by both web and mobile apps.

## 🛠️ Tech Stack

- **Monorepo**: Turborepo + Bun Workspaces
- **Web**: React, Vite, Tailwind CSS (v4), Framer Motion
- **Mobile**: React Native, Expo, React Native Skia (for pixelation)
- **Shared Logic**: TypeScript, Zod (for validation)
- **Data**: Static data for Flags, Dota 2, LoL, and Valorant.
- **CDN**: Flag images from [Flagpedia](https://flagpedia.net).

## 📦 Getting Started

1. **Install dependencies**:

    ```bash
    bun install
    ```

2. **Run web app**:

    ```bash
    bun dev:web
    ```

3. **Run mobile app**:
    ```bash
    bun dev:mobile
    ```

## 📐 Coding Standards

- **Kebab-case**: All files and folders use kebab-case.
- **Flat Structure**: Components and features follow a flat directory structure.
- **SSOT**: All game logic and data reside in `@pixel-guess/shared`.
- **No Backend**: The game is fully client-side with local storage for streaks and leaderboards.

Enjoy guessing! 🎮
