/**
 * Firebase (React Native Firebase, native SDK).
 *
 * The default app auto-initializes from GoogleService-Info.plist at native
 * startup, so we just grab handles here. Analytics collection is enabled
 * explicitly because the plist ships with IS_ANALYTICS_ENABLED = false.
 *
 * NOTE: importing this (any @react-native-firebase/*) requires a dev build that
 * includes the native modules — it will not run on an older JS-only build.
 */

import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import { getFirestore } from '@react-native-firebase/firestore';

const app = getApp();

export const analytics = getAnalytics(app);
export const db = getFirestore(app);

let started = false;

/** Enable analytics collection and log app open. Safe to call repeatedly. */
export async function initAnalytics() {
  if (started) return;
  started = true;
  try {
    await setAnalyticsCollectionEnabled(analytics, true);
    await logEvent(analytics, 'app_open');
  } catch {
    // analytics is best-effort; never block the app on it
  }
}

/** Log a custom analytics event. */
export async function track(name: string, params?: Record<string, unknown>) {
  try {
    await logEvent(analytics, name, params);
  } catch {
    // ignore
  }
}
