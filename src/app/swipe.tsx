import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { PlaceDetail } from '@/components/swipe/place-detail';
import { ReadyIntro } from '@/components/swipe/ready-intro';
import { SwipeCard } from '@/components/swipe/swipe-card';
import { CATEGORIES, CATEGORY_BY_KEY } from '@/constants/categories';
import { useNearbyPlaces } from '@/hooks/use-nearby-places';
import { distanceMeters, formatDistance, type Place } from '@/services/places';

type LikedPlace = Place & { distance?: number };
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');
const SWIPE_X = W * 0.26;

type Coords = { latitude: number; longitude: number } | null;
type Decision = 'no' | 'yes';

export default function SwipeScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const cat = CATEGORY_BY_KEY[category ?? 'food'] ?? CATEGORIES[0];

  const [started, setStarted] = useState(false);
  const [coords, setCoords] = useState<Coords>(null);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<LikedPlace[]>([]);
  const [detail, setDetail] = useState<LikedPlace | null>(null);

  const { data: places = [], isLoading } = useNearbyPlaces(cat.key, coords);

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const handleStarted = useCallback(() => setStarted(true), []);

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
    const sorted = withDistance.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    // Collapse same-named spots (chains) to just the closest one.
    const seen = new Set<string>();
    const unique = sorted.filter((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 30);
  }, [places, coords]);

  const recordAndAdvance = (dir: Decision) => {
    const place = deck[index];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (place && dir === 'yes') setLiked((l) => [...l, place]);
    setIndex((i) => i + 1);
    x.value = 0;
    y.value = 0;
  };

  const fling = (dir: Decision) => {
    x.value = withTiming(dir === 'yes' ? W * 1.5 : -W * 1.5, { duration: 280 }, (f) => {
      'worklet';
      if (f) runOnJS(recordAndAdvance)(dir);
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_X) {
        runOnJS(fling)('yes');
      } else if (e.translationX < -SWIPE_X) {
        runOnJS(fling)('no');
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const topPlace = deck[index];
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, success) => {
      if (success && topPlace) runOnJS(setDetail)(topPlace);
    });
  const cardGesture = Gesture.Race(pan, tap);

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, W], [-12, 12], 'clamp')}deg` },
    ],
  }));
  const secondStyle = useAnimatedStyle(() => {
    const p = Math.min((Math.abs(x.value) + Math.abs(y.value)) / SWIPE_X, 1);
    return {
      transform: [
        { translateX: interpolate(p, [0, 1], [18, 0]) },
        { translateY: interpolate(p, [0, 1], [14, 0]) },
        { rotate: `${interpolate(p, [0, 1], [6, 0])}deg` },
        { scale: interpolate(p, [0, 1], [0.95, 1]) },
      ],
      opacity: interpolate(p, [0, 1], [0.92, 1]),
    };
  });
  const yesBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, SWIPE_X], [0, 1], 'clamp') }));
  const noBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-SWIPE_X, 0], [1, 0], 'clamp') }));

  const done = index >= deck.length && deck.length > 0;

  if (!started) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ReadyIntro label={cat.label} onDone={handleStarted} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <ChevronLeft size={28} color={colors.text} />
              </Pressable>
              <Text style={[type.heading, { color: colors.text }]}>{cat.label}</Text>
              <Text
                numberOfLines={1}
                style={[type.label, { color: colors.textMuted, minWidth: 52, textAlign: 'right' }]}>
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
              <Results
                liked={liked}
                category={cat.label}
                onRestart={() => {
                  setIndex(0);
                  setLiked([]);
                }}
              />
            ) : (
              <>
                <View style={styles.deck}>
                  {deck
                    .slice(index, index + 3)
                    .map((place, depth) => ({ place, depth }))
                    .reverse()
                    .map(({ place, depth }) => {
                      if (depth === 2) {
                        return (
                          <Animated.View key={place.id} style={[styles.cardWrap, styles.thirdCard]}>
                            <SwipeCard place={place} />
                          </Animated.View>
                        );
                      }
                      if (depth === 1) {
                        return (
                          <Animated.View key={place.id} style={[styles.cardWrap, secondStyle]}>
                            <SwipeCard place={place} />
                          </Animated.View>
                        );
                      }
                      return (
                        <GestureDetector key={place.id} gesture={cardGesture}>
                          <Animated.View style={[styles.cardWrap, topStyle]}>
                            <Animated.View style={[styles.badge, styles.badgeLeft, { borderColor: palette.teal }, yesBadge]}>
                              <Text style={[type.heading, { color: palette.teal }]}>YES</Text>
                            </Animated.View>
                            <Animated.View style={[styles.badge, styles.badgeRight, { borderColor: palette.pink }, noBadge]}>
                              <Text style={[type.heading, { color: palette.pink }]}>NO</Text>
                            </Animated.View>
                            <SwipeCard place={place} />
                          </Animated.View>
                        </GestureDetector>
                      );
                    })}
                </View>

                <View style={styles.actions}>
                  <ActionButton color={palette.pink} onPress={() => fling('no')}>
                    <X size={30} color={palette.pink} strokeWidth={3} />
                  </ActionButton>
                  <ActionButton color={palette.teal} onPress={() => fling('yes')}>
                    <Check size={30} color={palette.teal} strokeWidth={3} />
                  </ActionButton>
                </View>
              </>
            )}
        </>
      </SafeAreaView>

      {detail ? <PlaceDetail place={detail} onClose={() => setDetail(null)} /> : null}
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
        width: 68,
        height: 68,
        borderRadius: 34,
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

function Results({
  liked,
  category,
  onRestart,
}: {
  liked: LikedPlace[];
  category: string;
  onRestart: () => void;
}) {
  return (
    <View style={{ flex: 1, padding: spacing.lg }}>
      <Text style={[type.display, { color: colors.text }]}>Your picks</Text>
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.lg }]}>
        {liked.length} {category.toLowerCase()} {liked.length === 1 ? 'spot' : 'spots'} you liked.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {liked.map((p) => (
          <View key={p.id} style={styles.likedRow}>
            <Text style={[type.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {p.name}
            </Text>
            {p.distance != null ? (
              <Text style={[type.label, { color: colors.textMuted }]}>{formatDistance(p.distance)}</Text>
            ) : null}
          </View>
        ))}
        {!liked.length ? (
          <Text style={[type.body, { color: colors.textMuted }]}>You passed on everything. Tough crowd.</Text>
        ) : null}
      </ScrollView>

      <View style={styles.resultButtons}>
        <Pressable onPress={onRestart} style={[styles.resultButton, styles.restartButton]}>
          <Text style={[type.heading, { color: colors.text }]}>Swipe again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={[styles.resultButton, { backgroundColor: palette.pink }]}>
          <Text style={[type.heading, { color: colors.text }]}>Done</Text>
        </Pressable>
      </View>
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
  thirdCard: {
    transform: [{ translateX: -18 }, { translateY: 26 }, { rotate: '-6deg' }, { scale: 0.9 }],
    opacity: 0.8,
  },
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  resultButton: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
