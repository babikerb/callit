import { View } from 'react-native';

import { AVATAR_BY_ID } from '@/constants/avatars';
import { palette } from '@/theme/tokens';

type AvatarProps = {
  id?: string;
  size?: number;
};

/** Renders a preset avatar: a brand-colored circle with its line icon. */
export function Avatar({ id, size = 48 }: AvatarProps) {
  const avatar = id ? AVATAR_BY_ID[id] : undefined;
  const color = avatar?.color ?? palette.purple;
  const Icon = avatar?.Icon;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {Icon ? <Icon size={size * 0.55} color="#FFFFFF" strokeWidth={2.25} /> : null}
    </View>
  );
}

export default Avatar;
