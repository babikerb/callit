import { router, useFocusEffect } from 'expo-router';
import { Crown, Flag, Lock, Star, ThumbsUp, Users, Zap, type LucideIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { getStats, type Stats } from '@/services/stats';
import { useProfileStore } from '@/stores/profile';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

const ACHIEVEMENTS: { id: string; label: string; Icon: LucideIcon; color: string; test: (s: Stats) => boolean }[] = [
  { id: 'first', label: 'First Call', Icon: Flag, color: palette.pink, test: (s) => s.created >= 1 },
  { id: 'host', label: 'Host (5)', Icon: Crown, color: palette.yellow, test: (s) => s.created >= 5 },
  { id: 'joiner', label: 'Joiner (3)', Icon: Users, color: palette.teal, test: (s) => s.joined >= 3 },
  { id: 'voter', label: 'Voter (50)', Icon: ThumbsUp, color: palette.orange, test: (s) => s.votes >= 50 },
  { id: 'decider', label: 'Decider (200)', Icon: Zap, color: palette.purple, test: (s) => s.votes >= 200 },
  { id: 'legend', label: 'Legend (25)', Icon: Star, color: palette.pink, test: (s) => s.created >= 25 },
];

export default function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const [stats, setStats] = useState<Stats>({ created: 0, joined: 0, votes: 0 });

  useFocusEffect(
    useCallback(() => {
      getStats().then(setStats);
    }, []),
  );

  const statCards = [
    { label: 'Calls', value: stats.created },
    { label: 'Joined', value: stats.joined },
    { label: 'Votes', value: stats.votes },
  ];

  return (
    <Screen section="profile" headline="Player Card" subtitle="Your name, avatar, and stats.">
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
        {statCards.map((s) => (
          <Card key={s.label} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[type.title, { color: palette.teal }]}>{s.value}</Text>
            <Text style={[type.label, { color: colors.textMuted }]}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <Text style={[type.heading, { color: colors.text, marginBottom: spacing.md }]}>Achievements</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {ACHIEVEMENTS.map((a) => {
            const earned = a.test(stats);
            const Icon = earned ? a.Icon : Lock;
            return (
              <View key={a.id} style={{ alignItems: 'center', gap: spacing.xs, width: 84 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: earned ? a.color : colors.surface,
                    borderWidth: 1,
                    borderColor: earned ? a.color : colors.border,
                  }}>
                  <Icon
                    size={26}
                    color={earned ? '#FFFFFF' : colors.textMuted}
                    fill={earned ? '#FFFFFF' : 'transparent'}
                    strokeWidth={earned ? 1.5 : 2.25}
                  />
                </View>
                <Text
                  style={[type.label, { color: earned ? colors.text : colors.textMuted, textAlign: 'center' }]}
                  numberOfLines={2}>
                  {earned ? a.label : '???'}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}
