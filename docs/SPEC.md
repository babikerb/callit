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
3. Friends join.
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

### Visual language — Retro Pop-Art
Derived from the app icon (three overlapping cards bursting out of a comic starburst). The whole app leans into a **bold, hand-drawn, Keith-Haring / pop-art** feel:

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
Animated speech bubbles, small haptic, Callit logo reveal.

### Onboarding
1. WHAT'S FOR DINNER?
2. EVERYONE SWIPES.
3. THE GROUP DECIDES.

### Authentication
- Continue with Apple
- Continue with Google
- Continue as Guest

**Guest users CAN:** join Calls, swipe, vote, view results.
**Guest users CANNOT:** save history, receive notifications, create groups.

### Home Screen
Sections: Active Calls · Invitations · Recent Calls · Trending.

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
Directions · Share · Save · Celebrate.

### Friends
Saved groups · Recent people · Favorites.

### Profile
Statistics: calls created, votes, favorite category, match percentage. Achievements.

---

## 7. Categories
- **FOOD** — Restaurants, Fast food, Late night
- **BOBA**
- **COFFEE**
- **DESSERT**
- **ACTIVITIES** — Bowling, Movies, Arcades
- **STUDY**
- **ANYTHING**

---

## 8. Notifications & Deep Linking
- **Notifications:** Friend joined · Match found · Voting complete · Reminder.
- **Deep link:** `callit.app/c/ABCD` → installed: open Call; not installed: App Store, continue after install.

---

## 9. Tech Stack

| Concern        | Choice |
|----------------|--------|
| Framework      | React Native + Expo + TypeScript |
| Routing        | expo-router |
| Navigation     | react-native-bottom-tabs, native-stack |
| UI             | @callstack/liquid-glass, @gorhom/bottom-sheet, expo-blur, react-native-svg, lucide-react-native |
| Animation      | react-native-reanimated, react-native-worklets |
| Gestures       | react-native-gesture-handler |
| Haptics        | expo-haptics |
| Images         | expo-image |
| Forms          | react-hook-form |
| State          | Zustand (User, Calls, Notifications, Theme) |
| Data fetching  | @tanstack/react-query |
| Auth           | Firebase Auth + expo-auth-session |
| Database       | Firestore |
| Storage        | Firebase Storage |
| Functions      | Cloud Functions |
| Notifications  | expo-notifications |
| Analytics      | posthog-react-native |
| Crash reporting| @sentry/react-native |
| Ads            | react-native-google-mobile-ads (AdMob) |
| Subscriptions  | react-native-purchases (RevenueCat) |
| Maps/Directions| react-native-map-link |
| Toasts         | react-native-toast-message |
| Confetti       | react-native-confetti-cannon |
| Places API     | OpenStreetMap (primary) · Geoapify (secondary) · Yelp (optional) — **avoid Google Places** |

### Firestore Collections
`users` · `calls` · `participants` · `votes` · `friendships` · `groups` · `notifications` · `inviteLinks`

---

## 10. Monetization

- **Free:** join, create, vote.
- **Callit Plus:** no ads, unlimited groups, advanced filters, premium themes.
- **Ads (never interrupt voting):** home feed, completed calls, guests. Formats: native, interstitial, rewarded.

---

## 11. Release Scope

### V1
Restaurants · Boba · Guest mode · Swiping · Results · Notifications · Ads.

### V2
Activities · Coffee · Statistics · Saved groups · Premium.

### V3
Scheduling · Availability · AI suggestions · Shared calendars.

### Future
Widgets · Live Activities · Share extension · iMessage extension · Apple Watch · Streaks · Achievements.
