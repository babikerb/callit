import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';

import { formatDistance, type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const { width: W } = Dimensions.get('window');

type Ranked = { place: Place & { distance?: number }; yes: number };

type ResultsPodiumProps = {
  ranked: Ranked[];
  onDone: () => void;
};

// Podium order on screen: 2nd (left), 1st (center, tallest), 3rd (right).
const COLUMNS = [
  { rank: 2, height: 116, color: palette.teal, revealAt: 2 },
  { rank: 1, height: 168, color: palette.pink, revealAt: 3 },
  { rank: 3, height: 90, color: palette.orange, revealAt: 1 },
];

/** Dramatic Kahoot-style podium reveal: 3rd, then 2nd, then the winner + confetti. */
export function ResultsPodium({ ranked, onDone }: ResultsPodiumProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const timers = [
      setTimeout(() => {
        setStep(1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 500),
      setTimeout(() => {
        setStep(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1300),
      setTimeout(() => {
        setStep(3);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const winner = ranked[0];
  const hasVotes = winner && winner.yes > 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={[type.display, { color: colors.text, textAlign: 'center' }]}>The call</Text>
        <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
          {hasVotes ? 'Your group decided.' : 'No yes votes. Run it back.'}
        </Text>
      </View>

      {/* Podium */}
      <View style={styles.podium}>
        {COLUMNS.map((col) => {
          const item = ranked[col.rank - 1];
          const revealed = step >= col.revealAt && !!item && item.yes >= 0;
          return (
            <View key={col.rank} style={styles.col}>
              {revealed && item ? (
                <>
                  <Animated.Text
                    entering={FadeIn.duration(200)}
                    numberOfLines={1}
                    style={[type.label, { color: colors.text, maxWidth: '100%' }]}>
                    {item.place.name}
                  </Animated.Text>
                  <Animated.View
                    entering={SlideInDown.springify().damping(15)}
                    style={[styles.bar, { height: col.height, backgroundColor: col.color }]}>
                    <Text style={[type.display, { color: '#FFFFFF', fontSize: 30 }]}>{col.rank}</Text>
                    <Text style={[type.label, { color: '#FFFFFF' }]}>{item.yes} yes</Text>
                  </Animated.View>
                </>
              ) : (
                <View style={[styles.bar, { height: col.height, backgroundColor: colors.surface }]} />
              )}
            </View>
          );
        })}
      </View>

      {/* Rest of the ranking */}
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

      {step >= 3 && hasVotes ? (
        <ConfettiCannon count={130} origin={{ x: W / 2, y: -20 }} autoStart fadeOut explosionSpeed={360} fallSpeed={3000} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: spacing.xs,
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
