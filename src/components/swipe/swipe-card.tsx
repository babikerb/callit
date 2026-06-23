import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { formatDistance, type Place } from '@/services/places';
import { colors, radius, spacing, type } from '@/theme/tokens';

type SwipeCardProps = {
  place: Place & { distance?: number };
};

/** Keyless OpenStreetMap static map centered on the place, with a marker. */
function staticMapUrl(lat: number, lon: number) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=600x500&maptype=mapnik&markers=${lat},${lon},red-pushpin`;
}

/**
 * A single place card: a real static map of the spot up top, name + distance
 * in the footer.
 */
export function SwipeCard({ place }: SwipeCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: staticMapUrl(place.latitude, place.longitude) }}
        style={styles.map}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.footer}>
        <Text style={[type.title, { color: colors.text }]} numberOfLines={1}>
          {place.name}
        </Text>
        {place.distance != null ? (
          <Text style={[type.body, { color: colors.textMuted }]}>{formatDistance(place.distance)} away</Text>
        ) : null}
        {/* Placeholders — to be filled later from free OSM tags only (no paid data). */}
        <View style={styles.pills}>
          {['Menu', 'Reviews', 'Photos', 'Hours'].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={[type.label, { color: colors.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default SwipeCard;
