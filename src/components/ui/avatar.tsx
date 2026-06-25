import { avataaars } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';

import { AVATAR_OPTIONS_BY_ID } from '@/constants/avatars';

type AvatarProps = {
  id?: string;
  size?: number;
};

const cache = new Map<string, string>();

function svgForSeed(seed: string): string {
  const cached = cache.get(seed);
  if (cached) return cached;
  const overrides = AVATAR_OPTIONS_BY_ID[seed] ?? {};
  const svg = createAvatar(avataaars, {
    seed,
    radius: 50,
    backgroundColor: ['6D28FF', 'F02F78', 'F66314', '38D6B5', 'FBCD12'],
    ...overrides,
  }).toString();
  cache.set(seed, svg);
  return svg;
}

/** Renders a humanoid cartoon avatar (DiceBear avataaars) from its seed. */
export function Avatar({ id, size = 48 }: AvatarProps) {
  const seed = id || 'callit';
  const svg = useMemo(() => svgForSeed(seed), [seed]);
  return <SvgXml xml={svg} width={size} height={size} />;
}

export default Avatar;
