/**
 * Callit design tokens — clean iOS 26, dark & vivid.
 *
 * One consistent near-black base across the whole app; brand colors (sampled
 * from the retro app icon) come through as neon accents, glass cards, and
 * glowing buttons. Personality lives in color + motion + haptics, not borders.
 *
 * Single source of truth for color/spacing/shape — import from here rather than
 * hardcoding hex values.
 */

import { Platform, type TextStyle } from 'react-native';
import type { SFSymbols7_0 } from 'sf-symbols-typescript';

/** Brand palette — pulled from the app icon's pixels. Loud on dark. */
export const palette = {
  purple: '#6D28FF',
  pink: '#F02F78',
  orange: '#F66314',
  yellow: '#FBCD12',
  teal: '#38D6B5',
  cream: '#F9F1D9',
  ink: '#141414',
  white: '#FFFFFF',
} as const;

/** Dark theme — semantic roles used across the app. */
export const colors = {
  bg: '#0D0B14', // near-black with a faint purple cast
  bgElevated: '#16121F', // raised panels / sheets
  surface: 'rgba(255,255,255,0.06)', // glass card fill on dark
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.12)', // hairline glass edge
  text: '#F4F2F8',
  textMuted: 'rgba(244,242,248,0.56)',
  accent: '#F02F78', // default brand accent (pink)
} as const;

/**
 * Per-section identity. Pages share the same dark base — only the *accent*
 * color changes (used on the section label + headline highlights), so the app
 * feels cohesive instead of six different themes.
 */
export type SectionKey = 'home' | 'create' | 'profile';

export const sections: Record<
  SectionKey,
  { label: string; accent: string; sf: SFSymbols7_0 }
> = {
  home: { label: 'Home', accent: palette.pink, sf: 'house.fill' },
  create: { label: 'Create', accent: palette.orange, sf: 'plus.circle.fill' },
  profile: { label: 'Profile', accent: palette.teal, sf: 'person.crop.circle.fill' },
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const hairline = { width: 1, color: colors.border } as const;

/** Rounded, heavy typography. */
export const fonts = Platform.select({
  ios: { rounded: 'ui-rounded', sans: 'system-ui' },
  default: { rounded: 'sans-serif', sans: 'sans-serif' },
  web: { rounded: 'var(--font-rounded, system-ui)', sans: 'system-ui' },
})!;

export const type = {
  display: { fontFamily: fonts.rounded, fontWeight: '900', fontSize: 40, letterSpacing: -0.5 } as TextStyle,
  title: { fontFamily: fonts.rounded, fontWeight: '800', fontSize: 28 } as TextStyle,
  heading: { fontFamily: fonts.rounded, fontWeight: '800', fontSize: 20 } as TextStyle,
  body: { fontFamily: fonts.rounded, fontWeight: '600', fontSize: 16 } as TextStyle,
  label: { fontFamily: fonts.rounded, fontWeight: '700', fontSize: 13, letterSpacing: 1 } as TextStyle,
} as const;

export const tokens = {
  palette,
  colors,
  sections,
  radius,
  spacing,
  hairline,
  fonts,
  type,
};

export default tokens;
