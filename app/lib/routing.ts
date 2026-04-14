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
 *   - Running / Walking / Cycling: roundtrip via a selected Weimar waypoint
 *     URL: /route/v1/{profile}/lng1,lat1;wp_lng,wp_lat;lng1,lat1
 *   - Yoga: one-way walk to selected park
 *     URL: /route/v1/foot/lng1,lat1;dest_lng,dest_lat
 */

import { ActivityType } from "../types";
import { RouteResult, Coordinate } from "../types/route";

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
 * Build a roundtrip route: start → waypoint → start.
 * Used for running, walking, cycling.
 */
export async function buildRoundtripRoute(
  activity: ActivityType,
  start: Coordinate,
  waypoint: Coordinate
): Promise<RouteResult> {
  const profile = activityToProfile(activity);
  // Three-point route: start → waypoint → start
  return osrmRoute(profile, [start, waypoint, start], true);
}

/**
 * Build a one-way route: start → destination.
 * Used for yoga (walk to the park).
 */
export async function buildOneWayRoute(
  activity: ActivityType,
  start: Coordinate,
  destination: Coordinate
): Promise<RouteResult> {
  const profile = activityToProfile(activity);
  return osrmRoute(profile, [start, destination], false);
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
