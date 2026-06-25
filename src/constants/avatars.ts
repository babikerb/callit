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

/** Hidden avatars unlocked only by redeeming a code. */
export const SECRET_AVATARS: Avatar[] = [
  {
    id: 'ShadowDread',
    options: { skinColor: ['241613'], top: ['dreads01'], hairColor: ['f02f78'] }, // dark skin, pink dreads
  },
];

/** Redeem code (uppercase) -> avatar id. */
export const REDEEM_CODES: Record<string, string> = {
  CALLITLEGEND: 'ShadowDread',
};

export const AVATAR_OPTIONS_BY_ID = Object.fromEntries(
  [...AVATARS, ...SECRET_AVATARS].map((a) => [a.id, a.options ?? {}]),
) as Record<string, Record<string, unknown>>;

export const randomAvatarId = () => AVATARS[Math.floor(Math.random() * AVATARS.length)].id;

/**
 * DiceBear HTTP API PNG for an avatar id — a colored circle (avatar inside),
 * matching the in-app Avatar. Used for the tab icon; the tab sets the render
 * size via width/height on the source so it matches the SF-symbol icons.
 */
export function avatarPngUrl(id: string, size = 192): string {
  const opts = AVATAR_OPTIONS_BY_ID[id] ?? {};
  const parts = [
    `seed=${encodeURIComponent(id)}`,
    `size=${size}`,
    `radius=50`,
    `scale=90`,
    `backgroundColor=6D28FF,F02F78,F66314,38D6B5,FBCD12`,
  ];
  for (const [k, v] of Object.entries(opts)) {
    const val = Array.isArray(v) ? v.join(',') : String(v);
    parts.push(`${k}=${encodeURIComponent(val)}`);
  }
  return `https://api.dicebear.com/9.x/avataaars/png?${parts.join('&')}`;
}
