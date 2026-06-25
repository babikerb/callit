import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import { Dimensions, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette, type } from '@/theme/tokens';

const { width: W, height: H } = Dimensions.get('window');

type ReadyIntroProps = {
  /** Category label, shown as a kicker ("DECIDING ON FOOD"). */
  label: string;
  onDone: () => void;
};

/**
 * Two clean Kahoot-style game-start screens that fade between each other:
 * "Are you ready?" then "Let's Callit!". Static shapes, no bouncing — kept
 * calm and readable.
 */
export function ReadyIntro({ label, onDone }: ReadyIntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t1 = setTimeout(() => {
      setPhase(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 1600);
    const t2 = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  const ready = phase === 0;

  return (
    <Animated.View
      key={phase}
      entering={FadeIn.duration(280)}
      style={[styles.stage, { backgroundColor: ready ? palette.purple : palette.pink }]}>
      {/* Slowly drifting decorative shapes */}
      <FloatingShape style={[styles.circle, { top: H * 0.13, right: W * 0.16 }]} delay={0} />
      <FloatingShape style={[styles.square, { bottom: H * 0.15, left: W * 0.16 }]} delay={800} />
      <FloatingShape style={[styles.triangle, { top: H * 0.16, left: W * 0.16 }]} delay={1600} />
      <FloatingShape style={[styles.ring, { bottom: H * 0.13, right: W * 0.14 }]} delay={2400} />

      <Text style={styles.kicker}>DECIDING ON {label.toUpperCase()}</Text>
      <Text style={styles.title}>{ready ? 'Are you ready?' : "Let's Callit!"}</Text>
    </Animated.View>
  );
}

/** A shape that drifts slowly and continuously (gentle Kahoot-style motion). */
function FloatingShape({ style, delay, children }: { style: ViewStyle | ViewStyle[]; delay: number; children?: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay, t]);

  const drift = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [-12, 12]) },
      { translateX: interpolate(t.value, [0, 1], [7, -7]) },
      { rotate: `${interpolate(t.value, [0, 1], [-5, 5])}deg` },
    ],
  }));

  return <Animated.View style={[styles.shape, style, drift]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 32,
  },
  shape: { position: 'absolute' },
  circle: { width: 56, height: 56, borderRadius: 28, backgroundColor: palette.teal },
  square: { width: 50, height: 50, borderRadius: 12, backgroundColor: palette.orange, transform: [{ rotate: '12deg' }] },
  ring: { width: 56, height: 56, borderRadius: 28, borderWidth: 8, borderColor: 'rgba(255,255,255,0.3)' },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 52,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  kicker: {
    ...type.label,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 2,
  },
  title: {
    fontFamily: type.display.fontFamily,
    fontWeight: '900',
    fontSize: 50,
    letterSpacing: -1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ReadyIntro;
