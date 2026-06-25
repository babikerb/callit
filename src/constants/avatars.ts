import {
  Bird,
  Cat,
  Crown,
  Dog,
  Fish,
  Flame,
  Ghost,
  Rabbit,
  Rocket,
  Squirrel,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { palette } from '@/theme/tokens';

export type Avatar = { id: string; Icon: LucideIcon; color: string };

/** Kahoot-style preset avatars: a fun line icon on a brand color (no emojis). */
export const AVATARS: Avatar[] = [
  { id: 'cat', Icon: Cat, color: palette.pink },
  { id: 'dog', Icon: Dog, color: palette.teal },
  { id: 'bird', Icon: Bird, color: palette.orange },
  { id: 'fish', Icon: Fish, color: palette.purple },
  { id: 'rabbit', Icon: Rabbit, color: palette.teal },
  { id: 'squirrel', Icon: Squirrel, color: palette.pink },
  { id: 'ghost', Icon: Ghost, color: palette.purple },
  { id: 'rocket', Icon: Rocket, color: palette.orange },
  { id: 'crown', Icon: Crown, color: palette.pink },
  { id: 'star', Icon: Star, color: palette.teal },
  { id: 'zap', Icon: Zap, color: palette.orange },
  { id: 'flame', Icon: Flame, color: palette.purple },
];

export const AVATAR_BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a])) as Record<string, Avatar>;

export const randomAvatarId = () => AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
