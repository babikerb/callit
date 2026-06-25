import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Slider } from '@/components/ui/slider';
import { CATEGORIES } from '@/constants/categories';
import { createCall } from '@/services/calls';
import { getProfile } from '@/services/identity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

export default function CreateScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState<string>(params.category ?? 'food');
  const [radiusMiles, setRadiusMiles] = useState(2);
  const [openNow, setOpenNow] = useState(true);
  const [busy, setBusy] = useState(false);

  // Keep the selection in sync when arriving from Home with a category.
  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  const onCreate = async () => {
    setBusy(true);
    try {
      const profile = await getProfile();
      if (!profile) {
        router.push({
          pathname: '/setup',
          params: { redirect: 'create', category, radius: String(radiusMiles), openNow: openNow ? '1' : '0' },
        });
        return;
      }
      const { callId } = await createCall(category, profile, { radiusMiles, openNow });
      router.push({ pathname: '/lobby', params: { callId, host: '1' } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen section="create" headline="Start a Call." subtitle="Confirm the category and filters, then share.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.pill,
                backgroundColor: active ? colors.surfaceStrong : colors.surface,
                borderWidth: 1,
                borderColor: active ? palette.orange : colors.border,
              }}>
              <c.Icon size={16} strokeWidth={2.25} color={active ? palette.orange : colors.text} />
              <Text style={[type.body, { color: active ? palette.orange : colors.text }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Radius</Text>
          <Text style={[type.body, { color: palette.orange }]}>{radiusMiles} mi</Text>
        </View>
        <Slider min={1} max={15} step={1} value={radiusMiles} onChange={setRadiusMiles} accent={palette.orange} />

        <View style={styles.toggleRow}>
          <Text style={[type.body, { color: colors.text }]}>Open now</Text>
          <Switch
            value={openNow}
            onValueChange={setOpenNow}
            trackColor={{ true: palette.orange, false: colors.border }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <Button
        label={busy ? 'Creating…' : 'Create Call'}
        color={palette.orange}
        disabled={busy}
        style={{ opacity: busy ? 0.6 : 1 }}
        onPress={onCreate}
      />
    </Screen>
  );
}

const styles = {
  toggleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: spacing.lg,
  },
};
