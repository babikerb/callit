import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { colors, palette, spacing, type } from '@/theme/tokens';

const STATS = [
  { label: 'Calls', value: '0' },
  { label: 'Votes', value: '0' },
  { label: 'Match %', value: '0%' },
];

export default function ProfileScreen() {
  return (
    <Screen section="profile" headline="Player card." subtitle="Your stats, streaks, and achievements.">
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {STATS.map((s) => (
          <Card key={s.label} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[type.title, { color: palette.teal }]}>{s.value}</Text>
            <Text style={[type.label, { color: colors.textMuted }]}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <Text style={[type.heading, { color: colors.text }]}>Achievements</Text>
        <Text style={[type.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
          Earn badges as you make the call.
        </Text>
      </Card>
    </Screen>
  );
}
