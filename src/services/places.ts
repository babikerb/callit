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
  /** Free OSM tags, when present. */
  cuisine?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/** OSM tag selectors per category (applied to both nodes and areas/ways). */
const FILTERS: Record<string, string[]> = {
  food: ['["amenity"="restaurant"]', '["amenity"="fast_food"]'],
  cafe: ['["amenity"="cafe"]', '["cuisine"="bubble_tea"]', '["shop"="bubble_tea"]'],
  dessert: ['["amenity"="ice_cream"]', '["shop"="pastry"]', '["shop"="confectionery"]'],
  // Activities = generic "stuff to do" beyond eating: parks/walks, murals,
  // viewpoints, museums, galleries, attractions, plus the active stuff.
  activities: [
    '["leisure"="park"]',
    '["leisure"="garden"]',
    '["tourism"="viewpoint"]',
    '["tourism"="artwork"]',
    '["tourism"="attraction"]',
    '["tourism"="museum"]',
    '["tourism"="gallery"]',
    '["tourism"="zoo"]',
    '["tourism"="theme_park"]',
    '["leisure"="bowling_alley"]',
    '["amenity"="cinema"]',
    '["leisure"="amusement_arcade"]',
    '["leisure"="escape_game"]',
    '["leisure"="miniature_golf"]',
    '["historic"="monument"]',
  ],
  // Fallback for any unknown category key.
  anything: ['["amenity"="restaurant"]', '["amenity"="cafe"]', '["amenity"="fast_food"]'],
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function fetchNearbyPlaces(
  category: string,
  latitude: number,
  longitude: number,
  radius = 2000,
): Promise<Place[]> {
  const filters = FILTERS[category] ?? FILTERS.anything;
  // Query nodes AND ways/areas (parks, museums, etc.) and get their center.
  const clauses = filters
    .map((f) => `node${f}(around:${radius},${latitude},${longitude});way${f}(around:${radius},${latitude},${longitude});`)
    .join('');
  const query = `[out:json][timeout:25];(${clauses});out center 60;`;

  const res = await fetch(OVERPASS_URL, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const json = (await res.json()) as { elements?: OverpassElement[] };

  return (json.elements ?? [])
    .map((e) => ({ e, lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon }))
    .filter((x): x is { e: OverpassElement; lat: number; lon: number } =>
      x.lat != null && x.lon != null && !!x.e.tags?.name,
    )
    .map(({ e, lat, lon }) => ({
      id: String(e.id),
      name: titleCasePlace(e.tags!.name),
      latitude: lat,
      longitude: lon,
      category,
      cuisine: e.tags!.cuisine,
      website: e.tags!.website ?? e.tags!['contact:website'],
      phone: e.tags!.phone ?? e.tags!['contact:phone'],
      openingHours: e.tags!.opening_hours,
    }))
    .slice(0, 60);
}

/** Title-case a place name while preserving acronyms (IHOP) and internal caps (McDonald's). */
export function titleCasePlace(name: string): string {
  return name
    .split(' ')
    .map((w) => {
      if (w.length <= 1) return w.toUpperCase();
      if (w === w.toUpperCase()) return w; // acronym: IHOP, KFC
      if (/[a-z]/.test(w) && /[A-Z]/.test(w.slice(1))) return w; // McDonald's, BurgerFi
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

/** Prettify an OSM cuisine tag, e.g. "coffee_shop;tea" -> "Coffee Shop". */
export function formatCuisine(cuisine?: string): string | undefined {
  if (!cuisine) return undefined;
  return cuisine
    .split(';')[0]
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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
