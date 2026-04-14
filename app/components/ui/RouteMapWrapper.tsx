"use client";

/**
 * Dynamic wrapper for LeafletMap — disables SSR since Leaflet needs `window`.
 */

import dynamic from "next/dynamic";
import { Coordinate, POIResult } from "../../types/route";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center"
      style={{ height: 360 }}
    >
      <p className="text-sm text-neutral-400">Loading map…</p>
    </div>
  ),
});

interface RouteMapWrapperProps {
  geometry: Coordinate[];
  pois: POIResult[];
  startLabel?: string;
  destinationName?: string;
}

export default function RouteMapWrapper(props: RouteMapWrapperProps) {
  return <LeafletMap {...props} />;
}
