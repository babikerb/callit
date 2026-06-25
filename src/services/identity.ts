import AsyncStorage from '@react-native-async-storage/async-storage';

import { randomAvatarId, REDEEM_CODES } from '@/constants/avatars';

export type Profile = { name: string; avatarId: string };

const KEY = 'callit.profile';
const UNLOCK_KEY = 'callit.unlockedAvatars';

export async function getProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

/** A starting profile for the setup form when none exists yet. */
export function blankProfile(): Profile {
  return { name: '', avatarId: randomAvatarId() };
}

export async function getUnlockedAvatars(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(UNLOCK_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

/** Redeem a code; returns the unlocked avatar id, or null if the code is invalid. */
export async function redeemCode(code: string): Promise<string | null> {
  const id = REDEEM_CODES[code.trim().toUpperCase()];
  if (!id) return null;
  const current = await getUnlockedAvatars();
  if (!current.includes(id)) {
    await AsyncStorage.setItem(UNLOCK_KEY, JSON.stringify([...current, id]));
  }
  return id;
}
