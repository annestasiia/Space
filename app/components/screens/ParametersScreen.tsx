"use client";

import { useState } from "react";
import { AppState } from "../../types";
import { ACTIVITY_PARAMS, TAGS } from "../../data/routes";
import {
  parseRequestedDistanceKm,
  selectWaypoint,
  selectYogaDestination,
} from "../../lib/weimar";
import {
  buildRoundtripRoute,
  buildOneWayRoute,
} from "../../lib/routing";
import { fetchNearbyPOIs } from "../../lib/overpass";

interface ParametersScreenProps {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

function SpaceLogo() {
  return (
    <span className="text-sm font-medium tracking-widest select-none">
      <span className="text-neutral-400">s</span>
      <span className="text-neutral-900">pace</span>
    </span>
  );
}

const SUPPORTED_TAGS = new Set([
  "quiet", "green", "waterside", "car-free", "shaded", "scenic view",
  "coffee at the end", "good for evenings",
]);

export default function ParametersScreen({ state, onNext, onBack }: ParametersScreenProps) {
  const [mainParam, setMainParam] = useState(state.mainParam || "");
  const [customParam, setCustomParam] = useState(state.customParam || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(state.tags || []);
  const [wishes, setWishes] = useState(state.wishes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  const activity = state.activity!;
  const { title, options } = ACTIVITY_PARAMS[activity];
  const startCoord = state.startCoord!;

  const toggleTag = (tag: string) => {
    if (!SUPPORTED_TAGS.has(tag)) return; // skip unsupported tags silently
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const effectiveParam = mainParam === "Custom" ? customParam.trim() : mainParam;
  const canBuild = effectiveParam.length > 0;

  async function handleBuild() {
    if (!canBuild) return;
    setBuildError(null);
    setIsLoading(true);

    try {
      let routeResult;
      let destinationName = "";

      if (activity === "yoga") {
        const dest = selectYogaDestination(startCoord.lat, startCoord.lng, effectiveParam);
        destinationName = dest.name;
        routeResult = await buildOneWayRoute(activity, startCoord, { lat: dest.lat, lng: dest.lng });
      } else {
        const distKm = parseRequestedDistanceKm(activity, effectiveParam);
        const waypoint = selectWaypoint(startCoord.lat, startCoord.lng, activity, distKm, selectedTags);
        destinationName = waypoint.name;
        routeResult = await buildRoundtripRoute(activity, startCoord, {
          lat: waypoint.lat,
          lng: waypoint.lng,
        });
      }

      // Fetch real nearby POIs near route end
      const endCoord = routeResult.endCoord;
      const pois = await fetchNearbyPOIs(endCoord.lat, endCoord.lng, activity, 500);

      onNext({
        mainParam: effectiveParam,
        customParam,
        tags: selectedTags,
        wishes,
        routeResult,
        destinationName,
        pois,
        routeError: null,
        screen: "result",
      });
    } catch (err: unknown) {
      setBuildError(
        err instanceof Error
          ? err.message
          : "Could not build route. Please try again."
      );
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-neutral-500 text-base font-light">Building your route in Weimar…</p>
          <p className="text-neutral-400 text-sm mt-2">Fetching real route data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Brand + Back */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <SpaceLogo />
        </div>

        {/* Main param */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 mb-6">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setMainParam(opt)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150
                  ${mainParam === opt
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-500"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {mainParam === "Custom" && (
            <input
              type="text"
              value={customParam}
              onChange={(e) => setCustomParam(e.target.value)}
              placeholder='e.g. "7 km" or "45 min"'
              className="mt-4 w-full px-5 py-3.5 border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              autoFocus
            />
          )}
        </div>

        {/* Tags */}
        <div className="mb-10">
          <h2 className="text-lg font-light text-neutral-900 mb-4">What matters in this route?</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const supported = SUPPORTED_TAGS.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={!supported}
                  title={!supported ? "Not yet supported in this demo" : undefined}
                  className={`px-4 py-2 rounded-full border text-sm transition-all duration-150
                    ${!supported ? "opacity-35 cursor-not-allowed border-neutral-100 text-neutral-400 bg-white" :
                      selectedTags.includes(tag)
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-500"
                    }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-neutral-400">Greyed-out filters are not supported in this demo</p>
        </div>

        {/* Wishes */}
        <div className="mb-10">
          <h2 className="text-lg font-light text-neutral-900 mb-3">Any specific requests?</h2>
          <textarea
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder="e.g. I want a calm evening run on a good surface"
            rows={3}
            className="w-full px-5 py-4 border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
          />
        </div>

        {buildError && (
          <p className="mb-6 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
            {buildError}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleBuild}
          disabled={!canBuild}
          className={`w-full py-4 rounded-xl text-base font-medium transition-all duration-150
            ${canBuild
              ? "bg-neutral-900 text-white hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }`}
        >
          Build route
        </button>
      </div>
    </div>
  );
}
