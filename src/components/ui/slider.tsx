import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { colors, palette, radius } from '@/theme/tokens';

type SliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  accent?: string;
};

const THUMB = 26;
const TRACK_H = 6;

/** Minimal pure-JS slider (no native module). Snaps to `step`. */
export function Slider({ min, max, step = 1, value, onChange, accent = palette.orange }: SliderProps) {
  const [width, setWidth] = useState(0);
  const pos = useSharedValue(0);

  // Initialize / re-sync the thumb when the track width is known.
  useEffect(() => {
    if (width > 0) pos.value = ((value - min) / (max - min)) * width;
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (xRaw: number) => {
    'worklet';
    if (width <= 0) return;
    const x = Math.max(0, Math.min(width, xRaw));
    pos.value = x;
    const raw = min + (x / width) * (max - min);
    const snapped = Math.min(max, Math.max(min, Math.round(raw / step) * step));
    runOnJS(onChange)(snapped);
  };

  const gesture = Gesture.Race(
    Gesture.Pan()
      .onBegin((e) => apply(e.x))
      .onUpdate((e) => apply(e.x)),
    Gesture.Tap().onEnd((e) => apply(e.x)),
  );

  const fillStyle = useAnimatedStyle(() => ({ width: pos.value }));
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value - THUMB / 2 }] }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: THUMB + 12, justifyContent: 'center' }}>
        <View
          style={{
            height: TRACK_H,
            borderRadius: TRACK_H,
            backgroundColor: colors.surfaceStrong,
            overflow: 'hidden',
          }}>
          <Animated.View style={[{ height: TRACK_H, backgroundColor: accent }, fillStyle]} />
        </View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: accent,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

export default Slider;
