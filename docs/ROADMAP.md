# Callit — Build Roadmap

The V1 build is broken into **6 phases**. Each phase ends with something runnable so we always have a working app. Detailed spec lives in [SPEC.md](./SPEC.md).

> Legend: ⬜ not started · 🟨 in progress · ✅ done

---

## Phase 0 — Project Setup ✅
*Foundation so everything else can be built.*

- ✅ Expo + TypeScript + expo-router scaffolded (`src/app` structure)
- ✅ App named **Callit**, slug `callit`, scheme `callit`
- ✅ EAS build profiles (`eas.json`) + GitHub Actions iOS build workflow (`.github/workflows/ios-build.yml`)
- ✅ Spec + roadmap docs
- ✅ **All** project dependencies installed up front (so only one dev build is ever needed) — see below
- ✅ Native config wired in `app.json`: bundle id `com.babiker.callit`, Apple Sign In, location/notification permissions, AdMob test IDs, Sentry, bottom-tabs
- ✅ `eas.json` build profiles + `build:ios:*` npm scripts; **iOS is the primary target**
- ✅ Published to GitHub, `eas init` linked (`@bbabiker/callit`), `EXPO_TOKEN` secret set
- ✅ Dev build made and installed on device — reused for all phases (JS hot-reloads)

**Build check:** `npm run ios` opens the app in the dev client. ✅

### Installed dependencies (all phases)
- **UI/Animation:** expo-glass-effect (native liquid glass — used instead of @callstack/liquid-glass), expo-blur, react-native-svg, lucide-react-native, react-native-reanimated, react-native-worklets, react-native-gesture-handler, @gorhom/bottom-sheet, react-native-bottom-tabs, react-native-confetti-cannon, react-native-toast-message
- **Core:** expo-haptics, expo-image, expo-location, expo-clipboard, expo-dev-client
- **State/Data:** zustand, @tanstack/react-query, react-hook-form
- **Auth/Backend:** firebase, expo-auth-session, expo-crypto, expo-apple-authentication, @react-native-async-storage/async-storage
- **Notifications:** expo-notifications
- **Monetization:** react-native-google-mobile-ads, react-native-purchases (RevenueCat)
- **Observability:** posthog-react-native, @sentry/react-native
- **Maps:** react-native-map-link

---

## Phase 1 — Design System & Shell ✅
*The look, feel, and navigation skeleton.*

- ✅ Clean iOS-26 dark theme tokens (`src/theme/tokens.ts`): palette, accents, spacing, radius, type. Flat — no glow/gradient/shadow.
- ✅ UI kit: `Card`, `Button`, `Screen`, `CategoryTile`.
- ✅ Tabs: Home · Create · Profile (iOS-26 glass `NativeTabs`, purple tint).
- ✅ Home launchpad (category grid → Create, + Join), Create configure step, Profile placeholder.
- ⬜ Splash + onboarding (optional — likely skipped given how simple the launchpad is).

**Build check:** ✅ Navigate all three tabs; pick a category to reach Create.

---

## Phase 2 — Swipe Prototype ⬜  ← NEXT
*The core mechanic, front-end only. No backend, no accounts, no new build.*

- Pull nearby places from the OSM service (`src/services/places.ts`, already built) for the chosen category.
- Swipe cards: name, distance, **static map placeholder** (plain image), photo when available (expo-image).
- Gestures (gesture-handler) + animations (reanimated): left = No, right = Yes, up = Love it. Big haptics, card stack.
- Local match tally + a simple results screen at the end.

**Build check:** Pick a category, swipe a stack of real nearby places, see your picks tallied.

---

## Phase 3 — Live Calls (backend) ⬜
*Make a Call real and multi-person. Settles the backend.*

- Firebase **anonymous** auth (device identity, no sign-in screens) + Firestore.
- Create Call → `calls`/`inviteLinks`; share link; deep link `callit.app/c/ABCD` to join.
- Lobby: live participants + per-person swipe progress (Firestore realtime).
- Everyone swipes the same place set; `votes` sync live.

**Build check:** Create on one device, join via link on another, both swipe and votes sync.

---

## Phase 4 — Results, Tie-Breaker & Winner ⬜
*Reveal the decision and celebrate.*

- Match computation → 100% / 75% / 50% buckets.
- Animated reveal + confetti (react-native-confetti-cannon).
- Tie-breaker final round; Winner screen: directions (react-native-map-link), share, celebrate.

**Build check:** Finish a Call end-to-end and reach a winner with directions.

---

## Phase 5 — Notifications, Ads, Accounts, Plus & Polish ⬜
*Production-readiness for launch.*

- expo-notifications: someone joined, match found, voting complete.
- AdMob: after a Call completes / between Calls — **never during voting**.
- **Accounts return here** (Apple/Google) + RevenueCat Callit Plus (no ads, advanced filters, themes) + Profile stats.
- Analytics (posthog) + crash reporting (Sentry, enable source maps), deep-link install fallback, toasts, empty/error states, final motion polish.

**Build check:** Notifications fire, ads only in allowed spots, Plus removes ads — ready for TestFlight.

---

## After V1
- **V2:** Notifications · Ads · Accounts · Callit Plus · Profile stats
- **V3:** Scheduling · Availability · AI suggestions · Shared calendars
- **Future:** Widgets · Live Activities · Share/iMessage extensions · Apple Watch · Streaks · Achievements

---

## How we'll work each phase
1. Pick the phase, I scope the concrete tasks.
2. Install only the packages that phase needs (keeps the build stable).
3. Build → run on device/simulator → adjust.
4. Optionally cut an iOS build via the GitHub Actions workflow (`Actions → iOS Build → Run workflow`).

## Making builds (from AthanNow workflow)
- **Local dev:** `npm run ios` / `npm run android` (Expo Go or dev client).
- **Cloud/CI iOS build:** GitHub → **Actions** → *iOS Build (local on macOS runner)* → **Run workflow** → pick `preview` / `development` / `production`. Produces a `.ipa` artifact.
- **Requires:** repo pushed to GitHub + `EXPO_TOKEN` repo secret (from expo.dev → Account → Access Tokens). Run `eas init` once to link the EAS project.
