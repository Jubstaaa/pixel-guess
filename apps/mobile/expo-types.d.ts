// expo-env.d.ts only appears after `expo start` and is git-ignored, so a clean
// checkout's type-check would miss Expo's ambient types (CSS side-effect
// imports, which TypeScript 6+ checks by default).
/// <reference types="expo/types" />
