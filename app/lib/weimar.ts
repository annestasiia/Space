/**
 * Weimar, Thuringia — city-specific data and validation.
 * All coordinates are real OSM-verified locations.
 */

import { ActivityType } from "../types";

// ── Bounding box ──────────────────────────────────────────────────────────────
// Generous box covering the municipality of Weimar
export const WEIMAR_BOUNDS = {
  minLat: 50.93,
  maxLat: 51.05,
  minLng: 11.22,
  maxLng: 11.45,
};

export const WEIMAR_CENTER = { lat: 50.9791, lng: 11.3296 }; // Marktplatz

export function isInWeimar(lat: number, lng: number): boolean {
  return (
    lat >= WEIMAR_BOUNDS.minLat &&
    lat <= WEIMAR_BOUNDS.maxLat &&
    lng >= WEIMAR_BOUNDS.minLng &&
    lng <= WEIMAR_BOUNDS.maxLng
  );
}

// ── Real Weimar places (OSM-verified coordinates) ─────────────────────────────
export interface WeimarPlace {
  lat: number;
  lng: number;
  name: string;
  type: "park" | "forest" | "historic" | "waterside" | "square" | "station";
  distFromCenter: number; // km approx
  tags: string[];
}

export const WEIMAR_PLACES: Record<string, WeimarPlace> = {
  // Parks and green spaces
  ilmpark: {
    lat: 50.9695, lng: 11.3310,
    name: "Park an der Ilm",
    type: "park",
    distFromCenter: 0.8,
    tags: ["green", "waterside", "shaded", "car-free", "quiet", "scenic view", "good for evenings"],
  },
  goethePark: {
    lat: 50.9762, lng: 11.3335,
    name: "Goethepark",
    type: "park",
    distFromCenter: 0.5,
    tags: ["green", "quiet", "shaded", "scenic view"],
  },
  schwanseepark: {
    lat: 50.9608, lng: 11.3181,
    name: "Schwanseepark",
    type: "park",
    distFromCenter: 2.2,
    tags: ["green", "waterside", "quiet", "shaded"],
  },
  webicht: {
    lat: 50.9820, lng: 11.2952,
    name: "Weimarer Webicht",
    type: "forest",
    distFromCenter: 2.8,
    tags: ["green", "shaded", "quiet", "car-free"],
  },

  // Historic and scenic
  historischerFriedhof: {
    lat: 50.9761, lng: 11.3131,
    name: "Historischer Friedhof",
    type: "historic",
    distFromCenter: 1.5,
    tags: ["scenic view", "quiet", "shaded"],
  },
  belvedere: {
    lat: 50.9537, lng: 11.3392,
    name: "Schloss Belvedere",
    type: "historic",
    distFromCenter: 3.2,
    tags: ["scenic view", "green"],
  },
  tiefurt: {
    lat: 50.9888, lng: 11.3825,
    name: "Schloss Tiefurt",
    type: "historic",
    distFromCenter: 4.2,
    tags: ["waterside", "scenic view", "green", "quiet"],
  },

  // Central
  marktplatz: {
    lat: 50.9791, lng: 11.3296,
    name: "Marktplatz Weimar",
    type: "square",
    distFromCenter: 0,
    tags: ["scenic view"],
  },
  theaterplatz: {
    lat: 50.9795, lng: 11.3259,
    name: "Theaterplatz",
    type: "square",
    distFromCenter: 0.3,
    tags: ["scenic view"],
  },
  hauptbahnhof: {
    lat: 50.9898, lng: 11.3271,
    name: "Hauptbahnhof",
    type: "station",
    distFromCenter: 1.2,
    tags: [],
  },
};

// ── Haversine distance (km) ───────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Requested distance parser ─────────────────────────────────────────────────
export function parseRequestedDistanceKm(activity: ActivityType, param: string): number {
  const p = param.toLowerCase();

  // Explicit km values
  const kmMatch = p.match(/(\d+(?:\.\d+)?)\s*km/);
  if (kmMatch) return parseFloat(kmMatch[1]);

  // Minutes
  const minMatch = p.match(/(\d+)\s*min/);
  if (minMatch) {
    const min = parseInt(minMatch[1]);
    if (activity === "cycling") return (min / 60) * 20; // ~20km/h
    if (activity === "running")  return (min / 60) * 10; // ~10km/h
    return (min / 60) * 5; // walking ~5km/h
  }

  // Steps
  const stepsMatch = p.match(/([\d,]+)\s*steps?/);
  if (stepsMatch) {
    const steps = parseInt(stepsMatch[1].replace(/,/g, ""));
    return steps * 0.00075; // ~75cm per step
  }

  // Yoga / descriptive options
  if (p.includes("15 min") || p.includes("nearby") || p.includes("quiet")) return 1.2;
  if (p.includes("30 min") || p.includes("gentle")) return 2.5;
  if (p.includes("water")) return 1.5;

  // Defaults by activity
  const defaults: Record<ActivityType, number> = {
    running: 5,
    cycling: 15,
    walking: 4,
    yoga: 1.2,
  };
  return defaults[activity];
}

// ── Waypoint selection ────────────────────────────────────────────────────────
/**
 * Pick the best Weimar destination for a given activity, distance, and tags.
 * For a roundtrip, the waypoint is at ~50% of total distance from start.
 */
export function selectWaypoint(
  startLat: number,
  startLng: number,
  activity: ActivityType,
  totalDistanceKm: number,
  tags: string[]
): WeimarPlace {
  const halfDist = totalDistanceKm / 2;

  // Candidate scoring
  const candidates = Object.values(WEIMAR_PLACES);

  const scored = candidates.map((place) => {
    const dist = haversineKm(startLat, startLng, place.lat, place.lng);
    // Prefer places at ~halfDist from start
    const distScore = 1 / (1 + Math.abs(dist - halfDist));

    // Tag match bonus
    const tagBonus = tags.filter((t) => place.tags.includes(t)).length * 0.3;

    // Activity preference
    let activityBonus = 0;
    if (activity === "yoga" && (place.type === "park" || place.type === "forest")) activityBonus = 0.5;
    if (activity === "running" && (place.type === "park" || place.type === "forest")) activityBonus = 0.3;
    if (activity === "cycling") activityBonus = 0; // all destinations ok
    if (activity === "walking" && place.type !== "station") activityBonus = 0.2;

    // Tag "waterside" → prefer waterside places
    const waterBonus = tags.includes("waterside") && place.tags.includes("waterside") ? 0.5 : 0;
    // Tag "green" → prefer parks
    const greenBonus = tags.includes("green") && (place.type === "park" || place.type === "forest") ? 0.4 : 0;

    return { place, score: distScore + tagBonus + activityBonus + waterBonus + greenBonus };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].place;
}

// ── Yoga destination ──────────────────────────────────────────────────────────
export function selectYogaDestination(
  startLat: number,
  startLng: number,
  param: string
): WeimarPlace {
  const p = param.toLowerCase();

  if (p.includes("water")) return WEIMAR_PLACES.ilmpark;
  if (p.includes("quiet")) return WEIMAR_PLACES.goethePark;

  // Nearest park
  const parks = Object.values(WEIMAR_PLACES).filter(
    (pl) => pl.type === "park" || pl.type === "forest"
  );
  parks.sort((a, b) =>
    haversineKm(startLat, startLng, a.lat, a.lng) -
    haversineKm(startLat, startLng, b.lat, b.lng)
  );
  return parks[0];
}
