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
import { CATEGORY_BY_KEY } from '@/constants/categories';
import {
  castVote,
  markDone,
  subscribeCall,
  subscribeParticipants,
  subscribeTally,
  type Call,
  type Participant,
} from '@/services/calls';
import { distanceMeters, formatDistance, type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');
const SWIPE_X = W * 0.26;

type Coords = { latitude: number; longitude: number } | null;
type Decision = 'no' | 'yes';
type DeckPlace = Place & { distance?: number };

export default function SwipeScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();

  const [call, setCall] = useState<Call | null>(null);
  const [coords, setCoords] = useState<Coords>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [detail, setDetail] = useState<DeckPlace | null>(null);

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const handleStarted = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!callId) return;
    return subscribeCall(callId, setCall);
  }, [callId]);

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

  const cat = call ? CATEGORY_BY_KEY[call.category] : undefined;
  const label = cat?.label ?? call?.category ?? '';

  // Shared deck (host-ordered); each device just adds its own distance.
  const deck: DeckPlace[] = useMemo(() => {
    const places = call?.places ?? [];
    return places.map((p) => ({ ...p, distance: coords ? distanceMeters(coords, p) : undefined }));
  }, [call?.places, coords]);

  const done = deck.length > 0 && index >= deck.length;

  useEffect(() => {
    if (done && callId) markDone(callId);
  }, [done, callId]);

  const recordAndAdvance = (dir: Decision) => {
    const place = deck[index];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (place && callId) castVote(callId, place.id, dir);
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
      if (e.translationX > SWIPE_X) runOnJS(fling)('yes');
      else if (e.translationX < -SWIPE_X) runOnJS(fling)('no');
      else {
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

  if (!started) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {call ? <ReadyIntro label={label} onDone={handleStarted} /> : <Loading />}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Pressable onPress={() => router.replace('/')} hitSlop={12}>
              <ChevronLeft size={28} color={colors.text} />
            </Pressable>
          </View>
          <Text style={[type.heading, { color: colors.text }]}>{label}</Text>
          <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
            <Text numberOfLines={1} style={[type.label, { color: colors.textMuted }]}>
              {deck.length && !done ? `${Math.min(index + 1, deck.length)}/${deck.length}` : ''}
            </Text>
          </View>
        </View>

        {!deck.length ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : done ? (
          <GroupResults callId={callId} deck={deck} />
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
      </SafeAreaView>

      {detail ? <PlaceDetail place={detail} onClose={() => setDetail(null)} /> : null}
    </View>
  );
}

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.textMuted} />
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

function GroupResults({ callId, deck }: { callId: string; deck: DeckPlace[] }) {
  const [tally, setTally] = useState<Record<string, number>>({});
  const [people, setPeople] = useState<Participant[]>([]);

  useEffect(() => {
    if (!callId) return;
    const a = subscribeTally(callId, setTally);
    const b = subscribeParticipants(callId, setPeople);
    return () => {
      a();
      b();
    };
  }, [callId]);

  const ranked = useMemo(
    () => [...deck].map((p) => ({ place: p, yes: tally[p.id] ?? 0 })).sort((a, b) => b.yes - a.yes),
    [deck, tally],
  );
  const doneCount = people.filter((p) => p.done).length;
  const winner = ranked[0];

  return (
    <View style={{ flex: 1, padding: spacing.lg }}>
      <Text style={[type.display, { color: colors.text }]}>The call</Text>
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.md }]}>
        {doneCount}/{people.length} done · live results
      </Text>

      {winner && winner.yes > 0 ? (
        <View style={styles.winnerCard}>
          <Text style={[type.label, { color: palette.pink, textTransform: 'uppercase' }]}>Winning</Text>
          <Text style={[type.title, { color: colors.text }]} numberOfLines={1}>
            {winner.place.name}
          </Text>
          <Text style={[type.body, { color: colors.textMuted }]}>
            {winner.yes} {winner.yes === 1 ? 'yes' : 'yeses'}
            {winner.place.distance != null ? `  ·  ${formatDistance(winner.place.distance)}` : ''}
          </Text>
        </View>
      ) : (
        <Text style={[type.body, { color: colors.textMuted }]}>No yes votes yet.</Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: spacing.md }}>
        {ranked.slice(1).map(({ place, yes }) => (
          <View key={place.id} style={styles.rankRow}>
            <Text style={[type.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={[type.label, { color: colors.textMuted }]}>{yes}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={() => router.replace('/')} style={styles.doneButton}>
        <Text style={[type.heading, { color: colors.text }]}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSide: { flex: 1, justifyContent: 'center' },
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
  winnerCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: palette.pink,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
