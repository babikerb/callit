import * as Haptics from 'expo-haptics';
import { Pressable, Text, type PressableProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, palette, radius, type } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  /** 'solid' = filled neon w/ glow, 'glass' = translucent secondary. */
  variant?: 'solid' | 'glass';
  color?: string;
  textColor?: string;
  style?: ViewStyle;
};

/**
 * Primary control: a rounded pill that scales on press with a haptic tap.
 * Solid buttons carry a neon glow in their own color (the "vivid" accent).
 */
export function Button({
  label,
  variant = 'solid',
  color = palette.pink,
  textColor,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const solid = variant === 'solid';
  const fg = textColor ?? (solid ? colors.text : colors.text);

  return (
    <AnimatedPressable
      onPressIn={(e) => {
        scale.value = withSpring(0.96, { stiffness: 500, damping: 30 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { stiffness: 500, damping: 30 });
        onPressOut?.(e);
      }}
      style={[
        {
          backgroundColor: solid ? color : colors.surfaceStrong,
          borderColor: solid ? 'transparent' : colors.border,
          borderWidth: solid ? 0 : 1,
          borderRadius: radius.pill,
          paddingVertical: 16,
          paddingHorizontal: 28,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
        style,
      ]}
      {...rest}>
      <Text style={[type.heading, { color: fg }]}>{label}</Text>
    </AnimatedPressable>
  );
}

export default Button;
