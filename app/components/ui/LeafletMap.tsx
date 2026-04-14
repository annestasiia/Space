"use client";

/**
 * Actual Leaflet map — imported only client-side (no SSR).
 * Uses CartoDB Positron tiles for a clean, minimal look matching the UI.
 */

import { useEffect, useRef } from "react";
import { Coordinate, POIResult } from "../../types/route";

// Fix Leaflet default marker icon path issue with webpack
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Override default icon URLs (webpack breaks Leaflet's default path resolution)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  geometry: Coordinate[];
  pois: POIResult[];
  startLabel?: string;
  destinationName?: string;
}

export default function LeafletMap({
  geometry,
  pois,
  startLabel = "Start",
  destinationName = "Destination",
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // ── Init map ─────────────────────────────────────────────
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    // CartoDB Positron — clean, minimal, light tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;

    // ── Route polyline ───────────────────────────────────────
    if (geometry.length > 0) {
      const latLngs = geometry.map((c) => L.latLng(c.lat, c.lng));

      L.polyline(latLngs, {
        color: "#171717",
        weight: 3,
        opacity: 0.85,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      // Start marker
      const startIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          background:#171717;border-radius:50%;
          border:2px solid white;
          box-shadow:0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker([geometry[0].lat, geometry[0].lng], { icon: startIcon })
        .bindTooltip(startLabel, { permanent: false, direction: "right" })
        .addTo(map);

      // End marker
      const endIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          background:white;border-radius:50%;
          border:2px solid #171717;
          box-shadow:0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(
        [geometry[geometry.length - 1].lat, geometry[geometry.length - 1].lng],
        { icon: endIcon }
      )
        .bindTooltip(destinationName, { permanent: false, direction: "right" })
        .addTo(map);

      // Fit map to route
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    }

    // ── POI markers ──────────────────────────────────────────
    pois.forEach((poi) => {
      const poiIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:8px;height:8px;
          background:#737373;border-radius:50%;
          border:1.5px solid white;
          box-shadow:0 1px 2px rgba(0,0,0,0.2);
        "></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });
      L.marker([poi.lat, poi.lng], { icon: poiIcon })
        .bindTooltip(`${poi.label}${poi.sublabel ? ` — ${poi.sublabel}` : ""}`, {
          direction: "top",
        })
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update route when geometry changes (re-render)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || geometry.length === 0) return;
    // Already rendered on mount — for dynamic updates, would need full layer management
  }, [geometry]);

  return (
    <div
      ref={containerRef}
      style={{ height: 360, width: "100%" }}
      className="rounded-xl overflow-hidden border border-neutral-200"
    />
  );
}
