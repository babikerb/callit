import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CATEGORY_BY_KEY } from '@/constants/categories';
import {
  callLink,
  getDeviceId,
  startSwiping,
  subscribeCall,
  subscribeParticipants,
  type Call,
  type Participant,
} from '@/services/calls';
import { refinePlaces } from '@/services/groq';
import { isOpenNow } from '@/services/hours';
import { distanceMeters, fetchNearbyPlaces } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

export default function LobbyScreen() {
  const { callId } = useLocalSearchParams<{ callId: string; host?: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [people, setPeople] = useState<Participant[]>([]);
  const [me, setMe] = useState('');
  const [starting, setStarting] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    getDeviceId().then(setMe);
  }, []);

  useEffect(() => {
    if (!callId) return;
    const unsubCall = subscribeCall(callId, setCall);
    const unsubPeople = subscribeParticipants(callId, setPeople);
    return () => {
      unsubCall();
      unsubPeople();
    };
  }, [callId]);

  // Once the host starts, everyone moves to swiping.
  useEffect(() => {
    if (call?.status === 'swiping' && !navigated.current) {
      navigated.current = true;
      router.replace({ pathname: '/swipe', params: { callId } });
    }
  }, [call?.status, callId]);

  const isHost = !!call && call.hostId === me;
  const category = call ? CATEGORY_BY_KEY[call.category] : undefined;

  const onShare = () => {
    if (!call) return;
    Share.share({
      message: `Join my Callit and help pick ${category?.label ?? call.category}. Code: ${call.code}  ${callLink(call.code)}`,
    });
  };

  const onStart = async () => {
    if (!call || !callId) return;
    setStarting(true);
    try {
      let coords = { latitude: 37.7749, longitude: -122.4194 };
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }
      const radiusMeters = (call.filters?.radiusMiles ?? 2) * 1609.34;
      let raw = await fetchNearbyPlaces(call.category, coords.latitude, coords.longitude, radiusMeters);
      if (call.filters?.openNow) {
        // Keep places that are open or have unknown hours (don't punish missing data).
        raw = raw.filter((p) => isOpenNow(p.openingHours) !== false);
      }
      const seen = new Set<string>();
      const deduped = raw
        .filter((p) => {
          const key = p.name.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => distanceMeters(coords, a) - distanceMeters(coords, b))
        .slice(0, 25);

      // AI pass: curate + clean names + order best-first (falls back to deduped).
      const places = (await refinePlaces(call.category, deduped)).slice(0, 20);
      await startSwiping(callId, places);
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={[type.label, { color: palette.pink, textTransform: 'uppercase' }]}>
              Deciding on {category?.label ?? call?.category ?? ''}
            </Text>
            <Text style={[type.display, { color: colors.text }]}>Lobby</Text>
          </View>

          {/* Code */}
          <View style={styles.codeCard}>
            <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Share code</Text>
            <Text style={[type.display, { color: colors.text, letterSpacing: 8 }]}>{call?.code ?? '····'}</Text>
          </View>

          {/* Share button */}
          <Pressable onPress={onShare} style={styles.shareButton}>
            <Share2 size={18} color={colors.text} strokeWidth={2.5} />
            <Text style={[type.heading, { color: colors.text }]}>Share invite</Text>
          </Pressable>

          {/* Participants */}
          <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>
            In the lobby ({people.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {people.map((p) => (
              <View key={p.id} style={{ alignItems: 'center', gap: spacing.xs, width: 76 }}>
                <Avatar id={p.avatarId} size={56} />
                <Text style={[type.label, { color: colors.text }]} numberOfLines={1}>
                  {p.name}
                </Text>
                {p.id === call?.hostId ? (
                  <Text style={[type.label, { color: palette.pink, fontSize: 10 }]}>HOST</Text>
                ) : null}
              </View>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          {isHost ? (
            <Button
              label={starting ? 'Starting…' : 'Start swiping'}
              color={palette.pink}
              disabled={starting}
              style={{ opacity: starting ? 0.6 : 1 }}
              onPress={onStart}
            />
          ) : (
            <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>
              Waiting for the host to start…
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = {
  codeCard: {
    alignItems: 'center' as const,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  shareButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
};
