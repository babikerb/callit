import { Globe, MapPin, Phone, Utensils, X } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { showLocation } from 'react-native-map-link';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StaticMap } from '@/components/swipe/static-map';
import { isToday, weeklyHours } from '@/services/hours';
import { formatCuisine, formatDistance, type Place } from '@/services/places';
import { colors, palette, radius, spacing, type } from '@/theme/tokens';

type PlaceDetailProps = {
  place: Place & { distance?: number };
  onClose: () => void;
};

/** Full-screen detail for a place: map, hours by day, and quick actions. */
export function PlaceDetail({ place, onClose }: PlaceDetailProps) {
  const cuisine = formatCuisine(place.cuisine);
  const week = weeklyHours(place.openingHours);

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <View>
            <StaticMap latitude={place.latitude} longitude={place.longitude} zoom={15} style={styles.map} />
            <Pressable onPress={onClose} style={styles.close} hitSlop={12}>
              <X size={22} color={colors.text} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={[type.display, { color: colors.text, fontSize: 30 }]}>{place.name}</Text>
            <Text style={[type.body, { color: colors.textMuted }]}>
              {[place.distance != null ? `${formatDistance(place.distance)} away` : null, cuisine]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>

            <View style={styles.actions}>
              <Action
                icon={<MapPin size={20} color={palette.pink} strokeWidth={2.5} />}
                label="Directions"
                onPress={() => showLocation({ latitude: place.latitude, longitude: place.longitude, title: place.name })}
              />
              <Action
                icon={<Utensils size={20} color={palette.yellow} strokeWidth={2.5} />}
                label="Menu"
                onPress={() =>
                  Linking.openURL(
                    place.website ?? `https://www.google.com/search?q=${encodeURIComponent(`${place.name} menu`)}`,
                  )
                }
              />
              {place.website ? (
                <Action
                  icon={<Globe size={20} color={palette.teal} strokeWidth={2.5} />}
                  label="Website"
                  onPress={() => Linking.openURL(place.website!)}
                />
              ) : null}
              {place.phone ? (
                <Action
                  icon={<Phone size={20} color={palette.orange} strokeWidth={2.5} />}
                  label="Call"
                  onPress={() => Linking.openURL(`tel:${place.phone}`)}
                />
              ) : null}
            </View>

            {week.length ? (
              <View style={styles.hoursCard}>
                <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Hours</Text>
                {week.map((d) => {
                  const todayRow = isToday(d.day);
                  return (
                    <View key={d.day} style={styles.hoursRow}>
                      <Text style={[type.body, { color: todayRow ? colors.text : colors.textMuted, fontWeight: todayRow ? '800' : '600' }]}>
                        {d.day}
                      </Text>
                      <Text style={[type.body, { color: todayRow ? colors.text : colors.textMuted, fontWeight: todayRow ? '800' : '600' }]}>
                        {d.hours}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[type.body, { color: colors.textMuted }]}>Hours not listed.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

function Action({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <View style={styles.action}>
      <Pressable onPress={onPress} style={styles.actionCircle}>
        {icon}
      </Pressable>
      <Text style={[type.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 100 },
  map: { width: '100%', height: 260, backgroundColor: colors.surface },
  close: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  action: { flex: 1, alignItems: 'center', gap: spacing.sm },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hoursCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default PlaceDetail;
