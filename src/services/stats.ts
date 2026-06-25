import AsyncStorage from '@react-native-async-storage/async-storage';

export type Stats = { created: number; joined: number; votes: number };

const KEY = 'callit.stats';
const DEFAULT: Stats = { created: 0, joined: 0, votes: 0 };

export async function getStats(): Promise<Stats> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Stats>) } : { ...DEFAULT };
}

export async function bumpStat(key: keyof Stats, by = 1): Promise<void> {
  const stats = await getStats();
  stats[key] = (stats[key] ?? 0) + by;
  await AsyncStorage.setItem(KEY, JSON.stringify(stats));
}
