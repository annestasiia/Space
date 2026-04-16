"use client";

import { AppState } from "../../types";
import { ACTIVITY_LABELS } from "../../data/routes";
import { formatDistance, formatDuration } from "../../lib/routing";
import { buildGoogleMapsUrl } from "../../lib/googleMaps";
import RouteMapWrapper from "../ui/RouteMapWrapper";
import { SpaceLogo } from "./Step1Screen";

interface ResultScreenProps {
  state: AppState;
  onReset: () => void;
}

export default function ResultScreen({ state, onReset }: ResultScreenProps) {
  const { activity, routeResult, pois, selectedTags, startLabel, destinationName, routeMessage } = state;
  const route = routeResult!;
  const activityLabel = ACTIVITY_LABELS[activity!];

  const mapsUrl = buildGoogleMapsUrl(route.geometry, activity!);

  const distStr = formatDistance(route.distanceMeters);
  const durStr = formatDuration(route.durationSeconds);
  const routeType = route.isRoundtrip ? "Loop" : "One-way";

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <div className="flex-1 max-w-sm mx-auto w-full px-5 scroll-smooth overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-10 pb-8">
          <button
            onClick={onReset}
            className="text-sm transition-opacity hover:opacity-60 flex items-center gap-1.5"
            style={{ color: "var(--fg-muted)" }}
          >
            ← New route
          </button>
          <SpaceLogo />
        </div>

        {/* Title */}
        <div className="mb-7">
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "var(--fg-subtle)" }}
          >
            {activityLabel}
          </p>
          <h1 className="text-[2rem] font-light leading-tight" style={{ color: "var(--fg)" }}>
            Your route<br />is ready!
          </h1>
          {destinationName && (
            <p className="text-sm mt-2" style={{ color: "var(--fg-muted)" }}>
              via {destinationName}
            </p>
          )}
        </div>

        {/* Soft route message */}
        {routeMessage && (
          <p className="text-sm mb-5 italic" style={{ color: "var(--fg-muted)" }}>
            {routeMessage}
          </p>
        )}

        {/* Stats card */}
        <div
          className="border rounded-2xl p-5 mb-5"
          style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}
        >
          <div
            className="grid grid-cols-3 gap-3 pb-4 mb-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-wide mb-1"
                style={{ color: "var(--fg-subtle)" }}
              >
                Distance
              </p>
              <p className="text-lg font-medium" style={{ color: "var(--fg)" }}>
                {distStr}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] uppercase tracking-wide mb-1"
                style={{ color: "var(--fg-subtle)" }}
              >
                Time
              </p>
              <p className="text-lg font-medium" style={{ color: "var(--fg)" }}>
                {durStr}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] uppercase tracking-wide mb-1"
                style={{ color: "var(--fg-subtle)" }}
              >
                Type
              </p>
              <p className="text-base font-medium" style={{ color: "var(--fg)" }}>
                {routeType}
              </p>
            </div>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--card-active-bg)",
                    color: "var(--card-active-fg)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="mb-5 rounded-2xl overflow-hidden">
          <RouteMapWrapper
            geometry={route.geometry}
            pois={pois}
            startLabel={startLabel || "Start"}
            destinationName={destinationName || "Destination"}
          />
        </div>

        {/* Route info */}
        <div className="mb-7 space-y-1.5">
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            <span className="font-medium" style={{ color: "var(--fg)" }}>
              Start:
            </span>{" "}
            {startLabel || "Your location"} — Weimar
          </p>
          {destinationName && (
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              <span className="font-medium" style={{ color: "var(--fg)" }}>
                {route.isRoundtrip ? "Via:" : "Destination:"}
              </span>{" "}
              {destinationName}, Weimar
            </p>
          )}
          <p className="text-xs mt-2" style={{ color: "var(--fg-subtle)" }}>
            Route via OSRM · OpenStreetMap data · Weimar
          </p>
        </div>

        {/* After the route — POIs */}
        {pois.length > 0 && (
          <div className="mb-8">
            <h2
              className="text-base font-light mb-3"
              style={{ color: "var(--fg)" }}
            >
              After the route
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {pois.map((poi) => (
                <div
                  key={`${poi.lat}-${poi.lng}`}
                  className="border rounded-xl px-4 py-3.5"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--card-bg)",
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {poi.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    {poi.sublabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            className="py-4 rounded-2xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--card-active-bg)",
              color: "var(--card-active-fg)",
            }}
            onClick={() => window.open(mapsUrl, "_blank")}
          >
            Start
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 border rounded-2xl text-sm font-medium text-center flex items-center justify-center transition-opacity hover:opacity-70"
            style={{
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          >
            Google Maps
          </a>
          <button
            onClick={onReset}
            className="py-4 border rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--fg)" }}
          >
            Rebuild
          </button>
          <button
            className="py-4 border rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--fg)" }}
            onClick={() => alert("Save feature coming soon.")}
          >
            Save
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-center font-light pb-10" style={{ color: "var(--fg-subtle)" }}>
          Have a great time out there.
        </p>
      </div>
    </div>
  );
}
