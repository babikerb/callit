import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { CATEGORIES } from '@/constants/categories';
import { createCall } from '@/services/calls';
import { getProfile } from '@/services/identity';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const FILTERS = [
  { label: 'Radius', value: '2 mi' },
  { label: 'Open now', value: 'On' },
  { label: 'Price', value: 'Any' },
];

export default function CreateScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState<string>(params.category ?? 'food');
  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    setBusy(true);
    try {
      const profile = await getProfile();
      if (!profile) {
        router.push({ pathname: '/setup', params: { redirect: 'create', category } });
        return;
      }
      const { callId } = await createCall(category, profile);
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
            <View
              key={c.key}
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
              }}
              onTouchEnd={() => setCategory(c.key)}>
              <c.Icon size={16} strokeWidth={2.25} color={active ? palette.orange : colors.text} />
              <Text style={[type.body, { color: active ? palette.orange : colors.text }]}>{c.label}</Text>
            </View>
          );
        })}
      </View>

      <Card padded={false}>
        {FILTERS.map((f, i) => (
          <View
            key={f.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.md,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}>
            <Text style={[type.body, { color: colors.text }]}>{f.label}</Text>
            <Text style={[type.body, { color: colors.textMuted }]}>{f.value}</Text>
          </View>
        ))}
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
