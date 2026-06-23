import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatDistance, type Place } from '@/services/places';
import { colors, radius, spacing, type } from '@/theme/tokens';

type SwipeCardProps = {
  place: Place & { distance?: number };
};

/**
 * A single place card. The top area is a static map placeholder for now
 * (swapped for a real static map image later); the footer shows name + distance.
 */
export function SwipeCard({ place }: SwipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={44} color={colors.textMuted} strokeWidth={2} />
        <Text style={[type.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>Map preview</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[type.title, { color: colors.text }]} numberOfLines={1}>
          {place.name}
        </Text>
        {place.distance != null ? (
          <Text style={[type.body, { color: colors.textMuted }]}>{formatDistance(place.distance)} away</Text>
        ) : null}
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
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
});

export default SwipeCard;
