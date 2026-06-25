/**
 * Optional AI refinement of nearby places via Groq.
 *
 * Takes the raw OSM list and asks an LLM to drop junk/irrelevant entries, fix
 * name capitalization, and order best-first for the chosen category. Always
 * falls back to the original list if the key is missing or the call fails.
 *
 * Reads EXPO_PUBLIC_GROQ_API (Expo only exposes EXPO_PUBLIC_* to the app).
 * NOTE: this embeds the key in the client bundle; move to a Cloud Function
 * before launch.
 */

import type { Place } from '@/services/places';

const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function refinePlaces(
  category: string,
  places: Place[],
  opts?: { maxPrice?: number; city?: string },
): Promise<Place[]> {
  if (!GROQ_KEY || places.length === 0) return places;

  const budgetLine =
    opts?.maxPrice && opts.maxPrice > 0
      ? ` Prefer places where a typical visit costs about $${opts.maxPrice} or less per person (use general knowledge; most have no price data, so don't drop a place just because price is unknown).`
      : '';
  const cityLine = opts?.city ? ` These places are in/near ${opts.city}.` : '';

  try {
    // Include coordinates so the model can disambiguate places that share names.
    const input = places.slice(0, 40).map((p) => ({
      id: p.id,
      name: p.name,
      cuisine: p.cuisine,
      lat: Number(p.latitude.toFixed(4)),
      lon: Number(p.longitude.toFixed(4)),
    }));
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You curate lists of real local places for a group decision app, using your knowledge of ' +
              'the area. Return strict JSON only.',
          },
          {
            role: 'user',
            content:
              `Category: ${category}.${cityLine} From this JSON list of nearby places (with coordinates), return ` +
              `{"places":[{"id":"...","name":"...","cuisine":"..."}]} keeping only genuine ${category} spots a ` +
              `group would actually go to. Use the city + coordinates to identify each place; some have multiple ` +
              `or messy names, so use the best-known real-world name. Remove junk, duplicates, and unnamed or ` +
              `irrelevant entries. Add a short cuisine/type when you know it. Keep the original id values exactly. ` +
              `Order best-first.` +
              budgetLine +
              ` Input: ${JSON.stringify(input)}`,
          },
        ],
      }),
    });
    if (!res.ok) return places;

    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) return places;

    const parsed = JSON.parse(content) as { places?: { id: string; name: string; cuisine?: string }[] };
    const refined = parsed.places;
    if (!Array.isArray(refined) || refined.length === 0) return places;

    const byId = new Map(places.map((p) => [p.id, p]));
    const out: Place[] = [];
    for (const r of refined) {
      const orig = byId.get(r.id);
      if (orig) out.push({ ...orig, name: r.name?.trim() || orig.name, cuisine: orig.cuisine ?? r.cuisine });
    }
    return out.length ? out : places;
  } catch {
    return places;
  }
}
