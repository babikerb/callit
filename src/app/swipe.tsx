import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Heart, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeCard } from '@/components/swipe/swipe-card';
import { CATEGORIES, CATEGORY_BY_KEY } from '@/constants/categories';
import { useNearbyPlaces } from '@/hooks/use-nearby-places';
import { distanceMeters, type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_X = W * 0.26;
const SWIPE_Y = 130;

type Coords = { latitude: number; longitude: number } | null;
type Decision = 'no' | 'yes' | 'love';

export default function SwipeScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const cat = CATEGORY_BY_KEY[category ?? 'food'] ?? CATEGORIES[0];

  const [coords, setCoords] = useState<Coords>(null);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Place[]>([]);

  const { data: places = [], isLoading } = useNearbyPlaces(cat.key, coords);

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deck = useMemo(() => {
    const withDistance = places.map((p) => ({ ...p, distance: coords ? distanceMeters(coords, p) : undefined }));
    return withDistance.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9)).slice(0, 30);
  }, [places, coords]);

  const recordAndAdvance = (dir: Decision) => {
    const place = deck[index];
    Haptics.impactAsync(
      dir === 'love' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium,
    );
    if (place && dir !== 'no') setLiked((l) => [...l, place]);
    setIndex((i) => i + 1);
    x.value = 0;
    y.value = 0;
  };

  const fling = (dir: Decision) => {
    if (dir === 'love') {
      y.value = withTiming(-H, { duration: 280 }, (f) => {
        'worklet';
        if (f) runOnJS(recordAndAdvance)('love');
      });
    } else {
      x.value = withTiming(dir === 'yes' ? W * 1.5 : -W * 1.5, { duration: 280 }, (f) => {
        'worklet';
        if (f) runOnJS(recordAndAdvance)(dir);
      });
    }
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_Y && Math.abs(e.translationX) < SWIPE_X) {
        runOnJS(fling)('love');
      } else if (e.translationX > SWIPE_X) {
        runOnJS(fling)('yes');
      } else if (e.translationX < -SWIPE_X) {
        runOnJS(fling)('no');
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, W], [-12, 12], 'clamp')}deg` },
    ],
  }));
  const behindStyle = useAnimatedStyle(() => {
    const progress = Math.min((Math.abs(x.value) + Math.abs(y.value)) / SWIPE_X, 1);
    return {
      transform: [{ scale: interpolate(progress, [0, 1], [0.94, 1]) }, { translateY: interpolate(progress, [0, 1], [14, 0]) }],
      opacity: interpolate(progress, [0, 1], [0.5, 1]),
    };
  });
  const yesBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, SWIPE_X], [0, 1], 'clamp') }));
  const noBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-SWIPE_X, 0], [1, 0], 'clamp') }));
  const loveBadge = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [-SWIPE_Y, 0], [1, 0], 'clamp') }));

  const done = index >= deck.length && deck.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={[type.heading, { color: colors.text }]}>{cat.label}</Text>
          <Text style={[type.label, { color: colors.textMuted, width: 28, textAlign: 'right' }]}>
            {deck.length ? `${Math.min(index + 1, deck.length)}/${deck.length}` : ''}
          </Text>
        </View>

        {isLoading && !deck.length ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.textMuted} />
            <Text style={[type.body, { color: colors.textMuted, marginTop: spacing.md }]}>
              Finding {cat.label.toLowerCase()} near you…
            </Text>
          </View>
        ) : !deck.length ? (
          <View style={styles.center}>
            <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
              {coords ? 'No places found nearby. Try another category.' : 'Turn on location to find places.'}
            </Text>
          </View>
        ) : done ? (
          <Results liked={liked} category={cat.label} />
        ) : (
          <>
            <View style={styles.deck}>
              {deck.slice(index, index + 2).reverse().map((place, i, arr) => {
                const isTop = i === arr.length - 1;
                if (!isTop) {
                  return (
                    <Animated.View key={place.id} style={[styles.cardWrap, behindStyle]}>
                      <SwipeCard place={place} />
                    </Animated.View>
                  );
                }
                return (
                  <GestureDetector key={place.id} gesture={pan}>
                    <Animated.View style={[styles.cardWrap, topStyle]}>
                      <Animated.View style={[styles.badge, styles.badgeLeft, { borderColor: palette.teal }, yesBadge]}>
                        <Text style={[type.heading, { color: palette.teal }]}>YES</Text>
                      </Animated.View>
                      <Animated.View style={[styles.badge, styles.badgeRight, { borderColor: palette.pink }, noBadge]}>
                        <Text style={[type.heading, { color: palette.pink }]}>NO</Text>
                      </Animated.View>
                      <Animated.View style={[styles.badge, styles.badgeTop, { borderColor: palette.yellow }, loveBadge]}>
                        <Text style={[type.heading, { color: palette.yellow }]}>LOVE</Text>
                      </Animated.View>
                      <SwipeCard place={place} />
                    </Animated.View>
                  </GestureDetector>
                );
              })}
            </View>

            <View style={styles.actions}>
              <ActionButton color={palette.pink} onPress={() => fling('no')}>
                <X size={28} color={palette.pink} strokeWidth={3} />
              </ActionButton>
              <ActionButton color={palette.yellow} onPress={() => fling('love')}>
                <Heart size={24} color={palette.yellow} strokeWidth={3} />
              </ActionButton>
              <ActionButton color={palette.teal} onPress={() => fling('yes')}>
                <Check size={28} color={palette.teal} strokeWidth={3} />
              </ActionButton>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function ActionButton({
  color,
  onPress,
  children,
}: {
  color: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {children}
    </Pressable>
  );
}

function Results({ liked, category }: { liked: Place[]; category: string }) {
  return (
    <View style={{ flex: 1, padding: spacing.lg }}>
      <Text style={[type.display, { color: colors.text }]}>Your picks</Text>
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.lg }]}>
        {liked.length} {category.toLowerCase()} {liked.length === 1 ? 'spot' : 'spots'} you liked.
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {liked.map((p) => (
          <View key={p.id} style={styles.likedRow}>
            <Text style={[type.body, { color: colors.text }]} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
        ))}
        {!liked.length ? (
          <Text style={[type.body, { color: colors.textMuted }]}>You passed on everything. Tough crowd.</Text>
        ) : null}
      </ScrollView>
      <Pressable onPress={() => router.back()} style={styles.doneButton}>
        <Text style={[type.heading, { color: colors.text }]}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  deck: { flex: 1, margin: spacing.lg },
  cardWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  badge: {
    position: 'absolute',
    zIndex: 10,
    borderWidth: 3,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(13,11,20,0.6)',
  },
  badgeLeft: { top: spacing.xl, left: spacing.xl, transform: [{ rotate: '-14deg' }] },
  badgeRight: { top: spacing.xl, right: spacing.xl, transform: [{ rotate: '14deg' }] },
  badgeTop: { bottom: 120, alignSelf: 'center' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.lg,
  },
  likedRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doneButton: {
    backgroundColor: palette.pink,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
