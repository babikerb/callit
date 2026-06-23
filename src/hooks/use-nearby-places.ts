import { useQuery } from '@tanstack/react-query';

import { fetchNearbyPlaces } from '@/services/places';

type Coords = { latitude: number; longitude: number } | null;

/** Fetches nearby places for a category once we know the user's location. */
export function useNearbyPlaces(category: string, coords: Coords) {
  return useQuery({
    queryKey: ['places', category, coords?.latitude, coords?.longitude],
    queryFn: () => fetchNearbyPlaces(category, coords!.latitude, coords!.longitude),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });
}
