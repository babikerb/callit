import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { getProfile, type Profile } from '@/services/identity';
import { colors, palette, spacing, type } from '@/theme/tokens';

const STATS = [
  { label: 'Calls', value: '0' },
  { label: 'Votes', value: '0' },
  { label: 'Match %', value: '0%' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, []),
  );

  return (
    <Screen section="profile" headline="Player card." subtitle="Your name, avatar, and stats.">
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar id={profile?.avatarId} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={[type.title, { color: colors.text }]} numberOfLines={1}>
              {profile?.name ?? 'No name yet'}
            </Text>
            <Pressable onPress={() => router.push('/setup')}>
              <Text style={[type.label, { color: palette.teal }]}>
                {profile ? 'Edit name & avatar' : 'Set up your player'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Card>

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
