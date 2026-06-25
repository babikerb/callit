import AsyncStorage from '@react-native-async-storage/async-storage';

import { randomAvatarId } from '@/constants/avatars';

export type Profile = { name: string; avatarId: string };

const KEY = 'callit.profile';

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
