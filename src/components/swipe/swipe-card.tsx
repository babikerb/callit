import { Clock } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StaticMap } from '@/components/swipe/static-map';
import { todaysHours } from '@/services/hours';
import { formatCuisine, formatDistance, type Place } from '@/services/places';
import { colors, radius, spacing, type } from '@/theme/tokens';

type SwipeCardProps = {
  place: Place & { distance?: number };
};

/**
 * A place card: a real static map up top; name, distance, cuisine, and today's
 * hours below. Tap (handled by the deck) opens the full detail view.
 * Memoized so swipe-state changes don't re-render it (and re-fetch the map).
 */
function SwipeCardImpl({ place }: SwipeCardProps) {
  const cuisine = formatCuisine(place.cuisine);
  const subtitle = [place.distance != null ? `${formatDistance(place.distance)} away` : null, cuisine]
    .filter(Boolean)
    .join('  ·  ');
  const today = todaysHours(place.openingHours);

  return (
    <View style={styles.card}>
      <StaticMap latitude={place.latitude} longitude={place.longitude} style={styles.map} />
      <View style={styles.footer}>
        <Text style={[type.title, { color: colors.text }]} numberOfLines={2}>
          {place.name}
        </Text>
        {subtitle ? <Text style={[type.body, { color: colors.textMuted }]}>{subtitle}</Text> : null}

        {today ? (
          <View style={styles.hoursRow}>
            <Clock size={15} color={colors.textMuted} strokeWidth={2.5} />
            <Text style={[type.label, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
              {today === 'Closed' ? 'Closed today' : today}
            </Text>
          </View>
        ) : null}

        <Text style={[type.label, { color: colors.textMuted, opacity: 0.7 }]}>Tap for details</Text>
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
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export const SwipeCard = memo(SwipeCardImpl);

export default SwipeCard;
