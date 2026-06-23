# Callit

Social decision-making app — groups create a **Call**, invite friends, swipe options, and the group's best matches win. Tagline: **MAKE THE CALL.**

## Read first
- **Product spec:** [docs/SPEC.md](./docs/SPEC.md) — brand, themes, screens, tech stack, scope.
- **Roadmap / phases:** [docs/ROADMAP.md](./docs/ROADMAP.md) — what to build, in order.

## Conventions
- Name is spelled **Callit** (not "CallIt"); the all-caps wordmark **CALLIT** is the logo treatment only.
- Stack: Expo + expo-router (`src/app`), TypeScript, Zustand, react-query, reanimated, gesture-handler.
- Per-section theming — see the Design System section of the spec.

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Making builds
- Local: `npm run ios` / `npm run android`.
- iOS CI build: GitHub → Actions → *iOS Build* → Run workflow (needs `EXPO_TOKEN` secret + `eas init`). Produces a `.ipa`.
