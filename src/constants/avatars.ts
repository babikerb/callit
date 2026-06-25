export type Avatar = { id: string };

/**
 * Preset avatars are DiceBear "avataaars" seeds — humanoid cartoon characters
 * (Kahoot-style). The id is the seed; the Avatar component renders it.
 */
const SEEDS = [
  'Felix',
  'Aneka',
  'Jasper',
  'Luna',
  'Milo',
  'Nova',
  'Pip',
  'Ruby',
  'Theo',
  'Zara',
  'Bruno',
  'Cleo',
  'Daisy',
  'Echo',
  'Mochi',
  'Gizmo',
];

export const AVATARS: Avatar[] = SEEDS.map((id) => ({ id }));

export const randomAvatarId = () => SEEDS[Math.floor(Math.random() * SEEDS.length)];
