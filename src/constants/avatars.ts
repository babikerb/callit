export type Avatar = { id: string; options?: Record<string, unknown> };

/**
 * Preset avatars are DiceBear "avataaars" seeds (humanoid cartoon characters).
 * Some carry option overrides for variety, including weird skin colors.
 * The id is the seed and is stored on the participant; options are looked up by
 * id so any device can render the same avatar.
 */
export const AVATARS: Avatar[] = [
  { id: 'Felix' },
  { id: 'Aneka' },
  { id: 'Jasper' },
  { id: 'Luna' },
  { id: 'Milo' },
  { id: 'Nova' },
  { id: 'Pip' },
  { id: 'Ruby' },
  { id: 'Theo' },
  { id: 'Zara' },
  { id: 'Bruno' },
  { id: 'Cleo' },
  { id: 'Goose' },
  { id: 'Waffle' },
  // Weird ones with odd skin colors:
  { id: 'Alien', options: { skinColor: ['77dd77'] } }, // green
  { id: 'Frost', options: { skinColor: ['6ec1e4'] } }, // blue
  { id: 'Slime', options: { skinColor: ['9be15d'] } }, // lime
  { id: 'Grape', options: { skinColor: ['b39ddb'] } }, // purple
  { id: 'Coral', options: { skinColor: ['ff8a80'] } }, // coral
  { id: 'Mint', options: { skinColor: ['57d9b5'] } }, // teal
];

export const AVATAR_OPTIONS_BY_ID = Object.fromEntries(
  AVATARS.map((a) => [a.id, a.options ?? {}]),
) as Record<string, Record<string, unknown>>;

export const randomAvatarId = () => AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
