import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceDetail } from '@/components/swipe/place-detail';
import { ReadyIntro } from '@/components/swipe/ready-intro';
import { ResultsPodium } from '@/components/swipe/results-podium';
import { SwipeCard } from '@/components/swipe/swipe-card';
import { CATEGORY_BY_KEY } from '@/constants/categories';
import {
  advanceIfReady,
  castSwipe,
  subscribeCall,
  subscribeParticipants,
  subscribeSwipeCount,
  subscribeTally,
  type Call,
  type Participant,
} from '@/services/calls';
import { distanceMeters, type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');
const SWIPE_X = W * 0.26;

type Coords = { latitude: number; longitude: number } | null;
type Decision = 'no' | 'yes';
type DeckPlace = Place & { distance?: number };

export default function SwipeScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();

  const [call, setCall] = useState<Call | null>(null);
  const [people, setPeople] = useState<Participant[]>([]);
  const [coords, setCoords] = useState<Coords>(null);
  const [started, setStarted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [detail, setDetail] = useState<DeckPlace | null>(null);

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const advancedRef = useRef(-1);

  const handleStarted = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!callId) return;
    const a = subscribeCall(callId, setCall);
    const b = subscribeParticipants(callId, setPeople);
    return () => {
      a();
      b();
    };
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

  const deck: DeckPlace[] = useMemo(() => {
    const places = call?.places ?? [];
    return places.map((p) => ({ ...p, distance: coords ? distanceMeters(coords, p) : undefined }));
  }, [call?.places, coords]);

  const ci = call?.currentIndex ?? 0;
  const done = call?.status === 'done' || (deck.length > 0 && ci >= deck.length);
  const current = deck[ci];

  // New card: allow swiping again.
  useEffect(() => {
    setVoted(false);
    x.value = 0;
    y.value = 0;
  }, [ci, x, y]);

  // Count swipes on the current card (reset first to avoid a stale-count auto-advance).
  useEffect(() => {
    if (!callId || done) return;
    setSwipeCount(0);
    return subscribeSwipeCount(callId, ci, setSwipeCount);
  }, [callId, ci, done]);

  // When everyone has swiped this card, advance (guarded).
  useEffect(() => {
    if (!callId || done) return;
    if (people.length > 0 && swipeCount >= people.length && advancedRef.current !== ci) {
      advancedRef.current = ci;
      advanceIfReady(callId, ci);
    }
  }, [swipeCount, people.length, ci, callId, done]);

  const submitVote = (dir: Decision) => {
    if (voted || !current || !callId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    castSwipe(callId, ci, current.id, dir);
    setVoted(true);
    x.value = withSpring(0);
    y.value = withSpring(0);
  };

  const pan = Gesture.Pan()
    .enabled(!voted)
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_X) runOnJS(submitVote)('yes');
      else if (e.translationX < -SWIPE_X) runOnJS(submitVote)('no');
      else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, success) => {
      if (success && current) runOnJS(setDetail)(current);
    });
  const cardGesture = Gesture.Race(pan, tap);

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, W], [-12, 12], 'clamp')}deg` },
    ],
  }));
  const yesBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, SWIPE_X], [0, 1], 'clamp') }));
  const noBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-SWIPE_X, 0], [1, 0], 'clamp') }));

  if (!started) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {call ? <ReadyIntro label={label} onDone={handleStarted} /> : <Centered><ActivityIndicator color={colors.textMuted} /></Centered>}
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
              {deck.length && !done ? `${Math.min(ci + 1, deck.length)}/${deck.length}` : ''}
            </Text>
          </View>
        </View>

        {!deck.length ? (
          <Centered>
            <ActivityIndicator color={colors.textMuted} />
          </Centered>
        ) : done ? (
          <GroupResults callId={callId} deck={deck} />
        ) : (
          <>
            <View style={styles.deck}>
              {deck[ci + 1] ? (
                <Animated.View style={[styles.cardWrap, styles.behindCard]}>
                  <SwipeCard place={deck[ci + 1]} />
                </Animated.View>
              ) : null}

              {current ? (
                <GestureDetector gesture={cardGesture}>
                  <Animated.View style={[styles.cardWrap, topStyle]}>
                    <Animated.View style={[styles.badge, styles.badgeLeft, { borderColor: palette.teal }, yesBadge]}>
                      <Text style={[type.heading, { color: palette.teal }]}>YES</Text>
                    </Animated.View>
                    <Animated.View style={[styles.badge, styles.badgeRight, { borderColor: palette.pink }, noBadge]}>
                      <Text style={[type.heading, { color: palette.pink }]}>NO</Text>
                    </Animated.View>
                    <SwipeCard place={current} />
                  </Animated.View>
                </GestureDetector>
              ) : null}
            </View>

            {/* Discuss hint */}
            <Text style={styles.hint}>
              Everyone votes on the same spot. Tap the card to discuss it.
            </Text>

            {/* Indicator + actions */}
            <View style={styles.bottom}>
              <View style={styles.progressPill}>
                <Text style={[type.label, { color: colors.text }]}>
                  {voted ? 'Waiting for others' : 'Your turn'} · {swipeCount}/{people.length} swiped
                </Text>
              </View>

              {voted ? (
                <ActivityIndicator color={colors.textMuted} />
              ) : (
                <View style={styles.actions}>
                  <ActionButton color={palette.pink} onPress={() => submitVote('no')}>
                    <X size={30} color={palette.pink} strokeWidth={3} />
                  </ActionButton>
                  <ActionButton color={palette.teal} onPress={() => submitVote('yes')}>
                    <Check size={30} color={palette.teal} strokeWidth={3} />
                  </ActionButton>
                </View>
              )}
            </View>
          </>
        )}
      </SafeAreaView>

      {detail ? <PlaceDetail place={detail} onClose={() => setDetail(null)} /> : null}
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
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

  useEffect(() => {
    if (!callId) return;
    return subscribeTally(callId, setTally);
  }, [callId]);

  const ranked = useMemo(
    () => [...deck].map((p) => ({ place: p, yes: tally[p.id] ?? 0 })).sort((a, b) => b.yes - a.yes),
    [deck, tally],
  );

  return <ResultsPodium ranked={ranked} onDone={() => router.replace('/')} />;
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
  behindCard: { transform: [{ translateY: 16 }, { scale: 0.94 }], opacity: 0.6 },
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
  hint: { ...type.label, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg },
  bottom: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  progressPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl },
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
