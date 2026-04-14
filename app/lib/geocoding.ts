/**
 * Nominatim geocoding — restricted to Weimar, Thuringia.
 * No API key required. Nominatim usage policy: max 1 req/sec, add User-Agent.
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */

import { isInWeimar, WEIMAR_CENTER } from "./weimar";

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "space-weimar-routes-demo/1.0";

// ── Geocode an address, restricted to Weimar/Thuringia ───────────────────────
export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  const params = new URLSearchParams({
    q: address + ", Weimar, Thüringen, Germany",
    format: "json",
    limit: "5",
    countrycodes: "de",
    viewbox: "11.22,51.05,11.45,50.93", // Weimar bounding box (lng_min,lat_max,lng_max,lat_min)
    bounded: "1",
    addressdetails: "0",
  });

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;

  const resp = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    signal: AbortSignal.timeout(8000),
  });

  if (!resp.ok) throw new Error("Geocoding service unavailable. Please try again.");

  const results = await resp.json();

  if (!results || results.length === 0) {
    // Retry without "bounded=1" to provide a better error
    throw new Error(
      `Address not found in Weimar: "${address}". Try a street name, place, or landmark.`
    );
  }

  const best = results[0];
  const lat = parseFloat(best.lat);
  const lng = parseFloat(best.lon);

  if (!isInWeimar(lat, lng)) {
    throw new Error(
      "This address is outside Weimar. The demo currently works only within Weimar, Thuringia."
    );
  }

  return { lat, lng, displayName: best.display_name };
}

// ── Validate a geolocation coordinate ────────────────────────────────────────
export function validateWeimarlocation(lat: number, lng: number): void {
  if (!isInWeimar(lat, lng)) {
    throw new Error(
      "Your current location is outside Weimar. This demo works only within Weimar, Thuringia."
    );
  }
}

// ── Browser geolocation (Promise wrapper) ────────────────────────────────────
export function getBrowserLocation(): Promise<GeocodedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          validateWeimarlocation(lat, lng);
          resolve({ lat, lng, displayName: "Current location" });
        } catch (e) {
          reject(e);
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            // Fall back gracefully to Weimar center for demo
            resolve({ ...WEIMAR_CENTER, displayName: "Weimar centre (demo fallback)" });
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error("Location unavailable. Please enter an address instead."));
            break;
          default:
            reject(new Error("Could not get your location. Please enter an address."));
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}
