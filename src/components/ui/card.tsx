import { View, type ViewProps } from 'react-native';

import { colors, hairline, radius, spacing } from '@/theme/tokens';

type CardProps = ViewProps & {
  /** Use the stronger glass fill for emphasis. */
  strong?: boolean;
  rounded?: number;
  padded?: boolean;
};

/**
 * Glass card on the dark base: a translucent fill with a hairline edge and a
 * soft shadow. The default surface for content throughout the app.
 */
export function Card({ strong, rounded = radius.lg, padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: strong ? colors.surfaceStrong : colors.surface,
          borderColor: hairline.color,
          borderWidth: hairline.width,
          borderRadius: rounded,
          padding: padded ? spacing.md : 0,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

export default Card;
