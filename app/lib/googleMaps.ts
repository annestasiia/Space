/**
 * Google Maps Directions URL builder.
 *
 * Limitation: Google Maps URLs support max 8 intermediate waypoints.
 * For routes with more geometry points, we downsample to key anchor points.
 * Google Maps will recalculate the exact path, so the result may differ
 * slightly from the OSRM route — but origin, destination, and key waypoints
 * are preserved, so the general route intent is maintained.
 *
 * URL format:
 *   https://www.google.com/maps/dir/?api=1
 *     &origin={lat},{lng}
 *     &destination={lat},{lng}
 *     &waypoints={lat},{lng}|{lat},{lng}
 *     &travelmode={walking|bicycling}
 */

import { ActivityType } from "../types";
import { Coordinate } from "../types/route";

type GoogleTravelMode = "walking" | "bicycling" | "driving" | "transit";

function activityToTravelMode(activity: ActivityType): GoogleTravelMode {
  if (activity === "cycling") return "bicycling";
  return "walking"; // running, walking, yoga → walking mode
}

/**
 * Downsample a polyline to at most `maxPoints` points using a simple
 * uniform stride approach. Keeps first and last point.
 */
function downsampleGeometry(coords: Coordinate[], maxPoints: number): Coordinate[] {
  if (coords.length <= maxPoints) return coords;
  const result: Coordinate[] = [coords[0]];
  const step = (coords.length - 2) / (maxPoints - 2);
  for (let i = 1; i < maxPoints - 1; i++) {
    const idx = Math.round(i * step);
    result.push(coords[idx]);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

function coordToStr(c: Coordinate): string {
  return `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`;
}

/**
 * Build a valid Google Maps Directions URL from route geometry.
 *
 * @param geometry   Full route geometry from OSRM (may be hundreds of points)
 * @param activity   Activity type for travel mode mapping
 * @returns          Google Maps URL string
 */
export function buildGoogleMapsUrl(
  geometry: Coordinate[],
  activity: ActivityType
): string {
  if (!geometry || geometry.length < 2) return "https://maps.google.com";

  const travelMode = activityToTravelMode(activity);

  // Keep max 10 total points: 1 origin + 8 waypoints + 1 destination
  // Google Maps supports up to 8 waypoints in the URL
  const sampled = downsampleGeometry(geometry, 10);

  const origin = coordToStr(sampled[0]);
  const destination = coordToStr(sampled[sampled.length - 1]);
  const waypoints = sampled
    .slice(1, -1)
    .map(coordToStr)
    .join("|");

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: travelMode,
  });

  if (waypoints) params.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
