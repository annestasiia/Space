"use client";

import { AppState } from "../../types";
import { ACTIVITY_LABELS } from "../../data/routes";
import { formatDistance, formatDuration } from "../../lib/routing";
import { buildGoogleMapsUrl } from "../../lib/googleMaps";
import RouteMapWrapper from "../ui/RouteMapWrapper";

interface ResultScreenProps {
  state: AppState;
  onReset: () => void;
}

function SpaceLogo() {
  return (
    <span className="text-sm font-medium tracking-widest select-none">
      <span className="text-neutral-400">s</span>
      <span className="text-neutral-900">pace</span>
    </span>
  );
}

export default function ResultScreen({ state, onReset }: ResultScreenProps) {
  const { activity, routeResult, pois, tags, startLabel, destinationName } = state;
  const route = routeResult!;
  const activityLabel = ACTIVITY_LABELS[activity!];

  const mapsUrl = buildGoogleMapsUrl(route.geometry, activity!);

  const distStr = formatDistance(route.distanceMeters);
  const durStr = formatDuration(route.durationSeconds);
  const routeType = route.isRoundtrip ? "Roundtrip" : "One-way";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Brand + Back */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onReset}
            className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
          >
            ← New route
          </button>
          <SpaceLogo />
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-neutral-400 mb-3">{activityLabel}</p>
          <h1 className="text-3xl sm:text-4xl font-light text-neutral-900">Your route is ready</h1>
          {destinationName && (
            <p className="text-sm text-neutral-500 mt-2">
              via {destinationName}
            </p>
          )}
        </div>

        {/* Stats card */}
        <div className="border border-neutral-200 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-neutral-100">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Distance</p>
              <p className="text-xl font-medium text-neutral-900">{distStr}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Time</p>
              <p className="text-xl font-medium text-neutral-900">{durStr}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Type</p>
              <p className="text-base font-medium text-neutral-900">{routeType}</p>
            </div>
          </div>
          {/* Selected tags shown as badges */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-neutral-900 text-white rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Real Leaflet map */}
        <div className="mb-6">
          <RouteMapWrapper
            geometry={route.geometry}
            pois={pois}
            startLabel={startLabel || "Start"}
            destinationName={destinationName || "Destination"}
          />
        </div>

        {/* Route info */}
        <div className="mb-8 space-y-1">
          <p className="text-sm text-neutral-500">
            <span className="text-neutral-900 font-medium">Start:</span>{" "}
            {startLabel || "Your location"} — Weimar
          </p>
          {destinationName && (
            <p className="text-sm text-neutral-500">
              <span className="text-neutral-900 font-medium">
                {route.isRoundtrip ? "Via:" : "Destination:"}
              </span>{" "}
              {destinationName}, Weimar
            </p>
          )}
          <p className="text-xs text-neutral-400 mt-2">
            Route generated via OSRM using OpenStreetMap data · Weimar, Thuringia
          </p>
        </div>

        {/* After route */}
        {pois.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-light text-neutral-900 mb-4">After the route</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pois.map((poi) => (
                <div key={`${poi.lat}-${poi.lng}`} className="border border-neutral-200 rounded-xl px-4 py-4">
                  <p className="text-sm font-medium text-neutral-900">{poi.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{poi.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <button
            className="py-4 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors"
            onClick={() => window.open(mapsUrl, "_blank")}
          >
            Start
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 border border-neutral-200 text-neutral-900 rounded-xl text-sm font-medium hover:border-neutral-500 transition-colors text-center flex items-center justify-center"
          >
            Open in Google Maps
          </a>
          <button
            onClick={onReset}
            className="py-4 border border-neutral-200 text-neutral-900 rounded-xl text-sm font-medium hover:border-neutral-500 transition-colors"
          >
            Rebuild
          </button>
          <button
            className="py-4 border border-neutral-200 text-neutral-900 rounded-xl text-sm font-medium hover:border-neutral-500 transition-colors"
            onClick={() => alert("Save feature coming soon.")}
          >
            Save
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-neutral-400 text-center font-light">Have a great workout.</p>
      </div>
    </div>
  );
}
