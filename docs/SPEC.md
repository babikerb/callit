# Callit — Product Spec

> **MAKE THE CALL.**
> The operating system for group decisions.

---

## 1. Overview

Callit is a social decision-making app that helps groups decide where to eat, drink, go, or hang out. Users create a **Call**, invite friends, swipe through options, and instantly discover the group's best matches. Callit removes decision paralysis and makes making plans fun.

### The Problem
Group chats spend 20–30 minutes deciding where to eat and land nowhere ("I don't care", "Anything works", "No sushi", "No Mexican"). Existing tools are too corporate, boring, complicated, and built for meetings instead of friends.

### Mission
Help people spend less time deciding and more time doing.

---

## 2. Core Loop

1. Create a Call.
2. Share the link.
3. People join via the link.
4. Everyone swipes.
5. Matches appear.
6. Group decides.

---

## 3. Audience

- **Primary:** College students, friend groups, young adults.
- **Secondary:** Families, couples, coworkers, clubs.

---

## 4. Brand & Personality

- **Name:** CALLIT
- **Tagline:** MAKE THE CALL.
- **Alt taglines:** "Stop arguing. Start deciding." · "Let the group decide." · "Decide together."
- **Personality:** Playful, competitive, social, energetic, bold, youthful.
- **NOT:** Corporate, professional, productivity-focused.
- **Feels like:** Kahoot, Nintendo, Duolingo, Discord, iOS 26 — fun, fast, animated, tactile.

### Logo / App Icon ✅
**Three overlapping cards** (orange, indigo, pink) fanned out, bursting from a **yellow comic starburst** on a purple field, with thick black ink outlines and cream card borders. The cards = everyone's options/choices; the burst = the energy of the group making the call. Pop-art / Keith-Haring vibe — feels like Kahoot / Discord, not Yelp / OpenTable. File: `assets/images/icon.png`.

---

### Visual language — Clean iOS 26 (Dark & Vivid)
**The app interior is clean iOS 26 — dark & vivid, flat.** The loud retro pop-art
lives in the **app icon only**; inside, the brand colors come through as neon
accents on a calm dark base. Personality is carried by **color + motion +
haptics**, not decoration.

Rules:
- **One dark base everywhere** (`#0D0B14`). Pages differ by content + accent color, **not** by full-page theming.
- **Flat. No glow, no gradients, no drop shadows.** Depth comes from translucency and hairline borders only.
- **Glass cards:** translucent white fill (`rgba(255,255,255,0.06)`) with a 1px hairline edge (`rgba(255,255,255,0.12)`).
- **iOS-26 liquid-glass tab bar** (system `NativeTabs`), tinted to brand purple.
- **Rounded, heavy type** for headlines; brand color used on the small section label + key words.
- **Vivid accents** — pink/orange/teal/yellow used boldly but sparingly (buttons, labels, stats).

### Color Palette (brand accents, sampled from the icon)
| Token  | Hex / Value             | Role |
|--------|-------------------------|------|
| Base   | `#0D0B14`               | App background (everywhere) |
| Surface| `rgba(255,255,255,0.06)`| Glass card fill |
| Border | `rgba(255,255,255,0.12)`| Hairline edges |
| Text   | `#F4F2F8`               | Primary text on dark |
| Purple | `#6D28FF`               | Tab tint / brand |
| Pink   | `#F02F78`               | Home accent, primary action |
| Orange | `#F66314`               | Create accent |
| Teal   | `#38D6B5`               | Profile accent, stats |
| Yellow | `#FBCD12`               | Highlights, rewards |

### Section accents (shared dark base)
| Tab     | Accent | Hex       |
|---------|--------|-----------|
| Home    | Pink   | `#F02F78` |
| Create  | Orange | `#F66314` |
| Profile | Teal   | `#38D6B5` |

### Typography
Rounded fonts — SF Rounded (iOS `ui-rounded`), Nunito, or Fredoka. Large headlines, heavy weights (700–900).

---

## 6. Screens & Flows

### Navigation
Floating liquid-glass tab bar (iOS-26 system `NativeTabs`): **Home · Create · Profile**.
Sharing is link-only, so there's no Friends tab; browsing/Explore folds into Home.

### Splash
Animated Callit icon reveal (cards + starburst), small haptic.

### Onboarding (optional for V1)
1. WHAT'S FOR DINNER?
2. EVERYONE SWIPES.
3. THE GROUP DECIDES.

Kept lightweight; may be cut given how self-explanatory the launchpad is.

### Authentication — deferred for V1
Given the app is one-shot and ephemeral (no history, no friends, link-only
sharing, guests can fully participate), **V1 ships account-less**: a lightweight
device identity, no sign-in screens. Accounts (Apple / Google) come back **when
premium ships**, since RevenueCat needs a stable identity to remember entitlements
— plus optionally a persistent name + avatar so you're recognizable in a lobby.

### Home Screen
A clean **launchpad**, not a feed: headline "What are we deciding?", the category
grid (tap one to start a Call), and a "Join a Call" affordance for a shared code.
No Active/Recent Calls (decisions are one-shot and ephemeral). No map on Home —
a **static map placeholder belongs on each swipe card**, rendered later as a plain
image (no native maps library, so no extra dev build).

### Create Flow
1. Choose category
2. Choose filters
3. Create Call
4. Share link

### Filters
Radius · Distance · Open now · Rating · Price.
**Premium:** advanced filters, multiple categories.

### Lobby Screen
Members · Progress · Invite button · Filters.

### Swipe Screen
Shows image, name, rating, distance.
Actions: **Left = No · Right = Yes · Up = Love it.** Large haptics, card animations.

### Results
Reveal at 100% / 75% / 50% match. Animated reveal + confetti.

### Tie Breaker
Final round over remaining options.

### Winner Screen
Directions · Share · Celebrate.

### Profile
Statistics: calls created, votes, favorite category, match percentage. Achievements.
(No friends list — sharing is link-only.)

---

## 7. Categories
Shipping set (V1): **Food · Boba · Coffee · Dessert · Activities**.
Removed Study and Anything (too vague for a places-based decision).
More can be added later (e.g. Bars, Late night).

---

## 8. Notifications & Deep Linking
- **Notifications:** Friend joined · Match found · Voting complete · Reminder.
- **Deep link:** `callit.app/c/ABCD` → installed: open Call; not installed: App Store, continue after install.

---

## 9. Tech Stack

| Concern        | Choice |
|----------------|--------|
| Framework      | React Native + Expo (SDK 56) + TypeScript |
| Routing        | expo-router |
| Navigation     | expo-router `NativeTabs` (iOS-26 liquid glass) + native-stack |
| UI             | expo-glass-effect, @gorhom/bottom-sheet, expo-blur, react-native-svg, lucide-react-native |
| Animation      | react-native-reanimated, react-native-worklets |
| Gestures       | react-native-gesture-handler |
| Haptics        | expo-haptics |
| Images         | expo-image |
| Forms          | react-hook-form |
| State          | Zustand (Call, Theme) |
| Data fetching  | @tanstack/react-query |
| Auth           | **Deferred for V1.** Firebase (anonymous → Apple/Google) when premium ships |
| Database       | Firestore (for live multi-person Calls) |
| Functions      | Cloud Functions |
| Notifications  | expo-notifications |
| Analytics      | posthog-react-native |
| Crash reporting| @sentry/react-native (source-map upload disabled until configured) |
| Ads            | react-native-google-mobile-ads (AdMob) |
| Subscriptions  | react-native-purchases (RevenueCat) |
| Directions     | react-native-map-link (deep-links out to Maps) |
| Static map     | plain image on swipe cards — **no native maps library** (react-native-maps was removed) |
| Toasts         | react-native-toast-message |
| Confetti       | react-native-confetti-cannon |
| Places API     | OpenStreetMap / Overpass (primary, keyless) · Geoapify (secondary) · Yelp (optional) — **avoid Google Places** |

### Firestore Collections
`calls` · `participants` · `votes` · `inviteLinks` · `notifications`
(No `users`/`friendships`/`groups` in V1 — account-less and link-only.)

---

## 10. Monetization

- **Free:** create, join, swipe, decide.
- **Callit Plus:** no ads, advanced filters, premium themes. (Requires accounts — ships alongside auth.)
- **Ads (never interrupt voting):** after a Call completes, between Calls. Formats: native, interstitial, rewarded.

---

## 11. Release Scope

### V1 (current focus)
Food · Boba · Coffee · Dessert · Activities · account-less/device identity ·
create + share-link · live lobby · swiping · results/winner. iOS-first.

### V2
Notifications · Ads · Accounts (Apple/Google) · Callit Plus · Profile stats.

### V3
Scheduling · Availability · AI suggestions · Shared calendars.

### Future
Widgets · Live Activities · Share extension · iMessage extension · Apple Watch · Streaks · Achievements.
