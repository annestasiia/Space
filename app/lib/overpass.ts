/**
 * Overpass API — fetch real OSM POIs near a coordinate.
 * Provider: https://overpass-api.de (free, no API key)
 * Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

import { POIResult } from "../types/route";
import { haversineKm } from "./weimar";
import { ActivityType } from "../types";

const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// ── Query builders ────────────────────────────────────────────────────────────

function buildQuery(lat: number, lng: number, radius: number, activity: ActivityType): string {
  const around = `(around:${radius},${lat},${lng})`;

  const cafeFilter = `node["amenity"="cafe"]${around};`;
  const drinkFilter = `node["amenity"="drinking_water"]${around};`;
  const parkFilter = `way["leisure"="park"]${around};`;
  const benchFilter = `node["amenity"="bench"]${around};`;
  const bikeShopFilter = `node["shop"="bicycle"]${around};`;
  const bikeRepairFilter = `node["amenity"="bicycle_repair_station"]${around};`;

  let elements: string;
  if (activity === "cycling") {
    elements = [cafeFilter, drinkFilter, bikeShopFilter, bikeRepairFilter].join("\n  ");
  } else if (activity === "yoga") {
    elements = [drinkFilter, parkFilter, benchFilter, cafeFilter].join("\n  ");
  } else {
    // running / walking
    elements = [cafeFilter, drinkFilter, parkFilter].join("\n  ");
  }

  return `[out:json][timeout:10];
(
  ${elements}
);
out center body;`;
}

// ── POI type labeling ─────────────────────────────────────────────────────────
function classifyPOI(tags: Record<string, string>): { label: string; sublabel: string } | null {
  if (tags.amenity === "cafe") {
    const name = tags.name ?? "Café";
    const spec = (tags.cuisine === "coffee_shop" || (tags.name ?? "").toLowerCase().includes("coffee"))
      ? "Specialty coffee"
      : name;
    return { label: spec, sublabel: tags.name ?? "" };
  }
  if (tags.amenity === "drinking_water") {
    return { label: "Water fountain", sublabel: tags.name ?? "Public fountain" };
  }
  if (tags.leisure === "park") {
    return { label: tags.name ?? "Park", sublabel: "Green area" };
  }
  if (tags.shop === "bicycle") {
    return { label: "Bike shop", sublabel: tags.name ?? "" };
  }
  if (tags.amenity === "bicycle_repair_station") {
    return { label: "Bike repair", sublabel: "Self-service station" };
  }
  if (tags.amenity === "bench") {
    return { label: "Rest spot", sublabel: "Bench" };
  }
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchNearbyPOIs(
  lat: number,
  lng: number,
  activity: ActivityType,
  radiusMeters = 400
): Promise<POIResult[]> {
  const query = buildQuery(lat, lng, radiusMeters, activity);

  let data: { elements: OverpassElement[] };
  try {
    const resp = await fetch(OVERPASS_BASE, {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(12000),
    });
    if (!resp.ok) throw new Error("Overpass unavailable");
    data = await resp.json();
  } catch {
    // POIs are non-critical — return empty array on failure
    return [];
  }

  const pois: POIResult[] = [];

  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {};
    const classified = classifyPOI(tags);
    if (!classified) continue;

    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (elLat == null || elLng == null) continue;

    const distKm = haversineKm(lat, lng, elLat, elLng);
    const distM = Math.round(distKm * 1000);

    pois.push({
      label: classified.label,
      sublabel: classified.sublabel || `${distM} m away`,
      lat: elLat,
      lng: elLng,
      distanceMeters: distM,
    });
  }

  // Sort by distance, deduplicate by label, cap at 4
  pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
  const seen = new Set<string>();
  return pois
    .filter((p) => {
      const key = p.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}
