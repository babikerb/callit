import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { CATEGORIES } from '@/constants/categories';
import { createCall } from '@/services/calls';
import { getProfile } from '@/services/identity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const RADIUS_OPTIONS = [1, 2, 5, 10];

export default function CreateScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState<string>(params.category ?? 'food');
  const [radiusMiles, setRadiusMiles] = useState(2);
  const [openNow, setOpenNow] = useState(false);
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
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Radius</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          {RADIUS_OPTIONS.map((mi) => {
            const active = radiusMiles === mi;
            return (
              <Pressable
                key={mi}
                onPress={() => setRadiusMiles(mi)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: active ? colors.surfaceStrong : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? palette.orange : colors.border,
                }}>
                <Text style={[type.body, { color: active ? palette.orange : colors.text }]}>{mi} mi</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[type.body, { color: colors.text }]}>Open now</Text>
            <Text style={[type.label, { color: colors.textMuted }]}>Hide places closed right now</Text>
          </View>
          <Switch
            value={openNow}
            onValueChange={setOpenNow}
            trackColor={{ true: palette.orange, false: colors.border }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <Button
        label={busy ? 'Starting…' : "Let's Callit!"}
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
