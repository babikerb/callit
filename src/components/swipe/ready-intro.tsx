import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { colors, palette, spacing, type } from '@/theme/tokens';

type ReadyIntroProps = {
  /** Category label, shown as a kicker ("DECIDING ON FOOD"). */
  label: string;
  onDone: () => void;
};

/**
 * Kahoot-style game-start hype: "Are you ready?" pops in, then "Let's Callit!",
 * then hands off to the deck. Haptics punctuate each beat.
 */
export function ReadyIntro({ label, onDone }: ReadyIntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const t1 = setTimeout(() => {
      setPhase(1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1300);
    const t2 = setTimeout(onDone, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <View style={styles.overlay}>
      <Animated.Text entering={ZoomIn.springify().damping(16)} style={styles.kicker}>
        DECIDING ON {label.toUpperCase()}
      </Animated.Text>

      {phase === 0 ? (
        <Animated.Text
          key="ready"
          entering={ZoomIn.springify().damping(12)}
          exiting={FadeOut.duration(140)}
          style={styles.ready}>
          Are you ready?
        </Animated.Text>
      ) : (
        <Animated.Text key="go" entering={ZoomIn.springify().damping(8)} style={styles.go}>
          Let&apos;s Callit!
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  kicker: {
    ...type.label,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  ready: {
    ...type.display,
    color: colors.text,
    textAlign: 'center',
  },
  go: {
    fontFamily: type.display.fontFamily,
    fontWeight: '900',
    fontSize: 52,
    letterSpacing: -1,
    color: palette.pink,
    textAlign: 'center',
  },
});

export default ReadyIntro;
