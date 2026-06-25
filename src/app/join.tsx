import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { joinCall } from '@/services/calls';
import { getProfile } from '@/services/identity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

export default function JoinScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onJoin = async () => {
    setBusy(true);
    setError(null);
    try {
      const profile = await getProfile();
      if (!profile) {
        router.replace({ pathname: '/setup', params: { redirect: 'join' } });
        return;
      }
      const callId = await joinCall(code, profile);
      router.replace({ pathname: '/lobby', params: { callId } });
    } catch {
      setError('Call not found. Check the code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ padding: spacing.lg, gap: spacing.lg, flex: 1 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>

          <Text style={[type.display, { color: colors.text }]}>Join a Call</Text>
          <Text style={[type.body, { color: colors.textMuted }]}>Enter the 4-character code a friend shared.</Text>

          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={4}
            style={[
              type.display,
              {
                color: colors.text,
                textAlign: 'center',
                letterSpacing: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: error ? palette.pink : colors.border,
                borderRadius: radius.lg,
                paddingVertical: spacing.lg,
              },
            ]}
          />
          {error ? <Text style={[type.label, { color: palette.pink }]}>{error}</Text> : null}

          <Button
            label="Join"
            color={palette.pink}
            disabled={busy || code.length < 4}
            style={{ opacity: busy || code.length < 4 ? 0.5 : 1 }}
            onPress={onJoin}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
