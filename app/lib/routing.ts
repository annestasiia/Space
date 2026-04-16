/**
 * OSRM routing — real route geometry via the public OSRM demo server.
 * Provider: Project-OSRM public API — https://router.project-osrm.org
 * No API key required. For production use, self-host OSRM.
 *
 * Profiles:
 *   foot  → running, walking, yoga
 *   bike  → cycling
 *
 * Route strategy:
 *   - Loop: start → N → E → S → W → start (4 waypoints around the start)
 *   - One-way: start → destination
 */

import { ActivityType } from "../types";
import { RouteResult, Coordinate } from "../types/route";

// Fixed average speeds per activity (km/h)
export const ACTIVITY_SPEEDS: Record<string, number> = {
  running: 7,
  walking: 4,
  cycling: 12,
  other: 4,
};

const OSRM_BASE = "https://router.project-osrm.org";

type OsrmProfile = "foot" | "bike";

function activityToProfile(activity: ActivityType): OsrmProfile {
  return activity === "cycling" ? "bike" : "foot";
}


// ── Core OSRM request ─────────────────────────────────────────────────────────
async function osrmRoute(
  profile: OsrmProfile,
  coordinates: Coordinate[],   // in order: start, ...waypoints, (optionally back to start)
  roundtrip: boolean
): Promise<RouteResult> {
  // OSRM expects lng,lat order
  const coordStr = coordinates
    .map((c) => `${c.lng},${c.lat}`)
    .join(";");

  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
  });

  const url = `${OSRM_BASE}/route/v1/${profile}/${coordStr}?${params}`;

  const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!resp.ok) {
    throw new Error(`Routing service returned ${resp.status}. Please try again.`);
  }

  const data = await resp.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No route found for this start point. Try a different location.");
  }

  const route = data.routes[0];

  // GeoJSON coordinates are [lng, lat] — convert to { lat, lng }
  const geometry: Coordinate[] = (route.geometry.coordinates as [number, number][]).map(
    ([lng, lat]) => ({ lat, lng })
  );

  return {
    geometry,
    distanceMeters: Math.round(route.distance),
    durationSeconds: Math.round(route.duration),
    startCoord: coordinates[0],
    endCoord: coordinates[coordinates.length - 1],
    isRoundtrip: roundtrip,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build a true loop route via N/E/S/W waypoints around the start.
 * start → North → East → South → West → start
 * Each waypoint is at ~totalDistanceKm/4 from the previous,
 * placed in cardinal directions so the route never retraces itself.
 */
export async function buildLoopRoute(
  activity: ActivityType,
  start: Coordinate,
  totalDistanceKm: number
): Promise<RouteResult> {
  const profile = activityToProfile(activity);

  // Radius: place each waypoint at ~D/4 from start in each cardinal direction
  const radius = totalDistanceKm / 4;

  // Convert km to degree offsets
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.cos((start.lat * Math.PI) / 180));

  const north: Coordinate = { lat: start.lat + radius * latPerKm, lng: start.lng };
  const east: Coordinate  = { lat: start.lat, lng: start.lng + radius * lngPerKm };
  const south: Coordinate = { lat: start.lat - radius * latPerKm, lng: start.lng };
  const west: Coordinate  = { lat: start.lat, lng: start.lng - radius * lngPerKm };

  // Loop: start → N → E → S → W → start (approach from different side)
  const result = await osrmRoute(profile, [start, north, east, south, west, start], true);

  // Override OSRM travel time with fixed-speed calculation
  const speedKmh = ACTIVITY_SPEEDS[activity] ?? 4;
  result.durationSeconds = Math.round((result.distanceMeters / 1000 / speedKmh) * 3600);

  return result;
}

/**
 * Build a roundtrip route: start → waypoint → start.
 * Kept for backwards compatibility with one-off waypoint routing.
 */
export async function buildRoundtripRoute(
  activity: ActivityType,
  start: Coordinate,
  waypoint: Coordinate
): Promise<RouteResult> {
  const profile = activityToProfile(activity);
  const result = await osrmRoute(profile, [start, waypoint, start], true);

  const speedKmh = ACTIVITY_SPEEDS[activity] ?? 4;
  result.durationSeconds = Math.round((result.distanceMeters / 1000 / speedKmh) * 3600);

  return result;
}

/**
 * Build a one-way route: start → destination.
 */
export async function buildOneWayRoute(
  activity: ActivityType,
  start: Coordinate,
  destination: Coordinate
): Promise<RouteResult> {
  const profile = activityToProfile(activity);
  const result = await osrmRoute(profile, [start, destination], false);

  // Override OSRM travel time with fixed-speed calculation
  const speedKmh = ACTIVITY_SPEEDS[activity] ?? 4;
  result.durationSeconds = Math.round((result.distanceMeters / 1000 / speedKmh) * 3600);

  return result;
}

// ── Formatting helpers ────────────────────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `~${m} min`;
}
