import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initAnalytics } from '@/services/firebase';
import { colors } from '@/theme/tokens';

const queryClient = new QueryClient();

const CallitDark = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg },
};

export default function RootLayout() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={CallitDark}>
          <StatusBar style="light" />
          <AnimatedSplashOverlay />
          <Stack
            screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="setup" options={{ presentation: 'modal' }} />
            <Stack.Screen name="join" />
            <Stack.Screen name="lobby" />
            <Stack.Screen name="swipe" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
