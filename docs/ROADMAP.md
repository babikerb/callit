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
- ⬜ *(you)* Publish to GitHub, run `eas init`, add `EXPO_TOKEN` repo secret
- ⬜ Make **one** dev build: `eas build -p ios --profile development` (or via the Actions workflow), install on device — reused for all phases

**Build check:** `npm run ios` opens the app in the dev client.

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

## Phase 1 — Design System & Shell ⬜
*The look, feel, and navigation skeleton. No real data yet.*

- Theme system: color tokens, per-section themes (Home/Create/Swipe/Results/Friends/Profile), typography (rounded font), spacing, glass/shadow tokens
- Reusable components: `GlassCard`, `Button`, `Pill/Tag`, `Header`, floating liquid-glass tab bar
- Tab navigation: Home · Explore · Create · Friends · Profile (placeholder screens, correct themes)
- Splash screen (animated bubbles + haptic) and 3-page onboarding
- Zustand `themeStore`

**Build check:** Navigate all 5 tabs; onboarding shows on first launch; each section has its own color identity.

---

## Phase 2 — Auth & Profile ⬜
*Who the user is, including guests.*

- Firebase project + config; Firebase Auth wired up
- Continue with Apple / Google / Guest
- Zustand `userStore`; guest-vs-account capability gating (guests can't save/notify/create groups)
- Profile screen shell with stats placeholders + achievements layout
- `users` Firestore collection (profile docs for non-guests)

**Build check:** Sign in via each method, see profile, sign out; guest restrictions enforced.

---

## Phase 3 — Create a Call & Lobby ⬜
*Start a decision and gather the group.*

- Create flow: choose category (Food, Boba) → filters (radius, open now, rating, price) → create → share link
- `calls`, `participants`, `inviteLinks` Firestore collections + creation logic
- Lobby screen: members, progress, invite button, filters
- Deep link `callit.app/c/ABCD` → join Call (route handling; install fallback later)
- Zustand `callsStore`; react-query for reads

**Build check:** Create a Call on one device, open the link on another, both appear in the lobby.

---

## Phase 4 — Swipe Engine ⬜
*The core loop: everyone votes.*

- Places fetch: OpenStreetMap primary (Geoapify fallback) for the chosen category + filters
- Swipe cards: image, name, rating, distance (expo-image)
- Gestures (gesture-handler) + animations (reanimated): left = No, right = Yes, up = Love it
- Large haptics on swipe; card stack physics
- Write `votes` to Firestore; track per-member progress in lobby

**Build check:** Group swipes through real nearby places; votes persist; lobby progress updates live.

---

## Phase 5 — Results, Tie-Breaker & Winner ⬜
*Reveal the decision and celebrate.*

- Match computation (Cloud Function or client) → 100% / 75% / 50% buckets
- Animated results reveal + confetti (react-native-confetti-cannon)
- Tie-breaker final round over remaining options
- Winner screen: directions (react-native-map-link), share, save, celebrate
- Recent Calls history (for accounts)

**Build check:** Finish a Call end-to-end and reach a winner with directions.

---

## Phase 6 — Notifications, Ads, Monetization & Polish ⬜
*Production-readiness for V1 launch.*

- expo-notifications: friend joined, match found, voting complete, reminder
- AdMob (react-native-google-mobile-ads): home feed, completed calls, guests — **never during voting**
- RevenueCat (react-native-purchases): Callit Plus (no ads, unlimited groups, advanced filters, premium themes)
- Analytics (posthog) + crash reporting (Sentry)
- Deep-link install fallback (App Store → continue after install), toasts, empty/error states, final motion polish

**Build check:** Notifications fire, ads show in allowed spots only, Plus purchase removes ads — ready for TestFlight.

---

## After V1
- **V2:** Activities · Coffee · Statistics · Saved groups (Friends) · Premium themes
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
