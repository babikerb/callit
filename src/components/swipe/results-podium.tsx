import * as Haptics from 'expo-haptics';
import { Crown } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';

import { type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');
const RED = '#C0182F';

type Ranked = { place: Place & { distance?: number }; yes: number };

type ResultsPodiumProps = {
  ranked: Ranked[];
  onDone: () => void;
};

// Podium order on screen: 2nd (left), 1st (center, tallest), 3rd (right).
const COLUMNS = [
  { rank: 2, height: 116, color: palette.teal },
  { rank: 1, height: 168, color: palette.pink },
  { rank: 3, height: 90, color: palette.orange },
];

/**
 * Kahoot-style reveal: a red "curtain" stage counts down the placements
 * (3rd, then 2nd, then the winner), then lifts to show the podium + full list.
 */
export function ResultsPodium({ ranked, onDone }: ResultsPodiumProps) {
  const sequence = useMemo(() => [3, 2, 1].filter((r) => ranked[r - 1]), [ranked]);
  const [revealStep, setRevealStep] = useState(0);
  const [showPodium, setShowPodium] = useState(false);

  const winner = ranked[0];
  const hasVotes = !!winner && winner.yes > 0;

  useEffect(() => {
    if (!ranked.length) {
      setShowPodium(true);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealStep(i);
      Haptics.impactAsync(
        i === sequence.length ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
      );
      if (i < sequence.length) timers.push(setTimeout(tick, 1700));
      else timers.push(setTimeout(() => setShowPodium(true), 2600));
    };
    timers.push(setTimeout(tick, 1000));
    return () => timers.forEach(clearTimeout);
  }, [ranked.length, sequence.length]);

  // Red curtain countdown
  if (!showPodium) {
    const rank = sequence[revealStep - 1];
    const item = rank ? ranked[rank - 1] : undefined;
    return (
      <View style={styles.stage}>
        <Text style={styles.curtainKicker}>RESULTS</Text>
        {item ? (
          <Animated.View key={rank} entering={FadeIn.duration(260)} style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text style={styles.rankBig}>#{rank}</Text>
            <Text style={styles.revealName} numberOfLines={2}>
              {item.place.name}
            </Text>
            <Text style={styles.revealVotes}>{item.yes} yes</Text>
          </Animated.View>
        ) : (
          <Text style={styles.revealName}>Counting the votes…</Text>
        )}
        {revealStep === sequence.length && hasVotes ? (
          <ConfettiCannon count={130} origin={{ x: W / 2, y: -20 }} autoStart fadeOut explosionSpeed={360} fallSpeed={3000} />
        ) : null}
      </View>
    );
  }

  // Podium + ranking
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={[type.display, { color: colors.text, textAlign: 'center' }]}>The Call</Text>
        <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
          {hasVotes ? 'Your group decided.' : 'No yes votes. Run it back.'}
        </Text>
      </View>

      <View style={styles.podium}>
        {COLUMNS.map((col) => {
          const item = ranked[col.rank - 1];
          return (
            <View key={col.rank} style={styles.col}>
              {col.rank === 1 && item ? <Crown size={28} color={palette.yellow} fill={palette.yellow} /> : null}
              {item ? (
                <Animated.Text
                  entering={FadeIn.duration(250)}
                  numberOfLines={2}
                  style={[type.label, { color: colors.text, maxWidth: '100%', textAlign: 'center' }]}>
                  {item.place.name}
                </Animated.Text>
              ) : null}
              <View style={[styles.bar, { height: col.height, backgroundColor: item ? col.color : colors.surface }]}>
                {item ? (
                  <>
                    <View style={styles.rankCircle}>
                      <Text style={[type.heading, { color: col.color }]}>{col.rank}</Text>
                    </View>
                    <Text style={[type.label, { color: '#FFFFFF' }]}>{item.yes} yes</Text>
                  </>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {ranked.slice(3).map(({ place, yes }, i) => (
          <View key={place.id} style={styles.row}>
            <Text style={[type.label, { color: colors.textMuted, width: 24 }]}>{i + 4}</Text>
            <Text style={[type.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={[type.label, { color: colors.textMuted }]}>{yes}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        <Pressable onPress={onDone} style={styles.doneButton}>
          <Text style={[type.heading, { color: colors.text }]}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  curtainKicker: { ...type.label, color: 'rgba(255,255,255,0.85)', letterSpacing: 3, position: 'absolute', top: 80 },
  rankBig: { fontFamily: type.display.fontFamily, fontWeight: '900', fontSize: 72, color: '#FFFFFF' },
  revealName: { ...type.title, color: '#FFFFFF', textAlign: 'center' },
  revealVotes: { ...type.body, color: 'rgba(255,255,255,0.85)' },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  col: { flex: 1, alignItems: 'center', gap: spacing.sm },
  bar: {
    width: '100%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
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
  },
});

export default ResultsPodium;
