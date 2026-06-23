/**
 * Nearby places via OpenStreetMap's Overpass API (keyless).
 * Maps Callit categories to OSM tags and returns named points around a coord.
 * Geoapify can slot in later as a higher-quality secondary source.
 */

export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/** OSM node filters per category. */
const FILTERS: Record<string, string[]> = {
  food: ['node["amenity"="restaurant"]', 'node["amenity"="fast_food"]'],
  cafe: ['node["amenity"="cafe"]', 'node["cuisine"="bubble_tea"]', 'node["shop"="bubble_tea"]'],
  dessert: ['node["amenity"="ice_cream"]', 'node["shop"="pastry"]', 'node["shop"="confectionery"]'],
  activities: [
    'node["leisure"="bowling_alley"]',
    'node["amenity"="cinema"]',
    'node["leisure"="amusement_arcade"]',
  ],
  // Fallback for any unknown category key.
  anything: ['node["amenity"="restaurant"]', 'node["amenity"="cafe"]', 'node["amenity"="fast_food"]'],
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

export async function fetchNearbyPlaces(
  category: string,
  latitude: number,
  longitude: number,
  radius = 2000,
): Promise<Place[]> {
  const filters = FILTERS[category] ?? FILTERS.anything;
  const clauses = filters.map((f) => `${f}(around:${radius},${latitude},${longitude});`).join('');
  const query = `[out:json][timeout:25];(${clauses});out body 50;`;

  const res = await fetch(OVERPASS_URL, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const json = (await res.json()) as { elements?: OverpassElement[] };

  return (json.elements ?? [])
    .filter((e): e is Required<OverpassElement> => !!(e.tags?.name && e.lat != null && e.lon != null))
    .map((e) => ({
      id: String(e.id),
      name: e.tags.name,
      latitude: e.lat,
      longitude: e.lon,
      category,
    }))
    .slice(0, 50);
}

/** Haversine distance in meters between two coords. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) return `${Math.round(meters * 3.28084)} ft`;
  return `${miles.toFixed(1)} mi`;
}
