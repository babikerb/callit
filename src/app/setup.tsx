import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IdentityForm } from '@/components/identity-form';
import { createCall } from '@/services/calls';
import { blankProfile, getProfile, saveProfile, type Profile } from '@/services/identity';
import { colors, spacing, type } from '@/theme/tokens';

export default function SetupScreen() {
  const params = useLocalSearchParams<{
    redirect?: string;
    category?: string;
    radius?: string;
    openNow?: string;
  }>();
  const [initial, setInitial] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setInitial(p ?? blankProfile()));
  }, []);

  const onSubmit = async (profile: Profile) => {
    setBusy(true);
    try {
      await saveProfile(profile);
      if (params.redirect === 'create' && params.category) {
        const filters = { radiusMiles: Number(params.radius) || 2, openNow: params.openNow === '1' };
        const { callId } = await createCall(params.category, profile, filters);
        router.replace({ pathname: '/lobby', params: { callId, host: '1' } });
      } else if (params.redirect === 'join') {
        router.replace('/join');
      } else {
        router.back();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}>
          <Text style={[type.display, { color: colors.text }]}>Who are you?</Text>
          {initial ? (
            <IdentityForm initial={initial} submitLabel="Continue" busy={busy} onSubmit={onSubmit} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
