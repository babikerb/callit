import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Category } from '@/constants/categories';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CategoryTileProps = {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
};

/** A flat, tappable category tile: line icon + label, hairline edge. */
export function CategoryTile({ category, selected, onPress }: CategoryTileProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const { Icon, label } = category;

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95, { stiffness: 500, damping: 30 });
        Haptics.selectionAsync();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 500, damping: 30 });
      }}
      onPress={onPress}
      style={[
        {
          flexBasis: '47%',
          flexGrow: 1,
          gap: spacing.sm,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: selected ? colors.surfaceStrong : colors.surface,
          borderWidth: 1,
          borderColor: selected ? palette.pink : colors.border,
        },
        animatedStyle,
      ]}>
      <Icon size={26} strokeWidth={2.25} color={selected ? palette.pink : colors.text} />
      <Text style={[type.heading, { color: colors.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}

export default CategoryTile;
