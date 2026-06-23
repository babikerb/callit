import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

import { CATEGORIES } from '@/constants/categories';
import { colors, radius, spacing, type } from '@/theme/tokens';

// Sensible default until we have the user's location.
const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ['22%', '55%', '92%'], []);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (cancelled) return;
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        700,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle="dark"
      />

      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.bgElevated }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}>
        <BottomSheetView style={styles.sheet}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.textMuted} strokeWidth={2.5} />
            <BottomSheetTextInput
              placeholder="Search places near you"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={[type.body, styles.searchInput]}
            />
          </View>

          <Text style={[type.label, styles.sectionLabel]}>Start a Call</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push({ pathname: '/create', params: { category: c.key } });
                }}
                style={styles.chip}>
                <c.Icon size={18} color={colors.text} strokeWidth={2.25} />
                <Text style={[type.body, { color: colors.text }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: colors.text,
  },
  sectionLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
