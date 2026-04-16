"use client";

import { useEffect, useState, useRef } from "react";
import { AppState, ActivityType } from "../../types";
import { ACTIVITY_LABELS, TAG_TO_ROUTING } from "../../data/routes";
import {
  parseRequestedDistanceKm,
  selectOneWayDestination,
} from "../../lib/weimar";
import { buildLoopRoute, buildOneWayRoute } from "../../lib/routing";
import { fetchNearbyPOIs } from "../../lib/overpass";
import { geocodeAddress } from "../../lib/geocoding";

interface Step6Props {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
}

function buildSummaryWords(state: AppState): string[] {
  const words: string[] = [];
  const activity = state.activity as ActivityType;

  words.push(ACTIVITY_LABELS[activity]);

  if (state.mainParam) words.push(state.mainParam);

  if (state.routeType) {
    words.push(state.routeType === "loop" ? "Loop route" : "One-way route");
  }

  if (state.startLabel) {
    words.push(`from ${state.startLabel.split(",")[0]}`);
  }

  if (state.selectedTags.length > 0) {
    words.push(...state.selectedTags.slice(0, 3));
  }

  if (state.locality) {
    words.push(state.locality === "first-time" ? "First time here" : "Local");
  }

  // Extract keywords from wishes
  if (state.wishes) {
    const keywords = state.wishes
      .split(/[\s,]+/)
      .filter((w) => w.length > 4)
      .slice(0, 2);
    words.push(...keywords);
  }

  return words.length > 0 ? words : ["Building your route…"];
}

export default function Step6Screen({ state, onNext }: Step6Props) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [wordKey, setWordKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasFired = useRef(false);

  const summaryWords = buildSummaryWords(state);

  // Cycle through summary words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIdx((i) => (i + 1) % summaryWords.length);
      setWordKey((k) => k + 1);
    }, 1600);
    return () => clearInterval(interval);
  }, [summaryWords.length]);

  // Run route building exactly once on mount
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    buildRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buildRoute() {
    try {
      const activity = state.activity as ActivityType;
      const startCoord = state.startCoord!;

      // Convert effective param to km
      const effectiveParam = state.mainParam;
      const distKm = parseRequestedDistanceKm(activity, effectiveParam);

      // Convert new tags to legacy routing tags for waypoint scoring
      const routingTags = Array.from(
        new Set(
          state.selectedTags.flatMap((t) => TAG_TO_ROUTING[t] ?? [])
        )
      );

      let routeResult;
      let destinationName = "";

      if (state.routeType === "loop") {
        routeResult = await buildLoopRoute(activity, startCoord, distKm);
        destinationName = "";

        // Soft message if actual distance differs from requested by >15%
        const actualKm = routeResult.distanceMeters / 1000;
        const tolerance = 0.15;
        let routeMessage: string | null = null;
        if (actualKm > distKm * (1 + tolerance)) {
          routeMessage = "Your route turned out a little longer than planned — but we think you'll love it!";
        } else if (actualKm < distKm * (1 - tolerance)) {
          routeMessage = "Your route turned out a little shorter than planned — but we think you'll love it!";
        }

        const pois = await fetchNearbyPOIs(
          routeResult.endCoord.lat,
          routeResult.endCoord.lng,
          activity,
          500
        );
        onNext({ routeResult, destinationName, pois, routeError: null, routeMessage, screen: "result" });
        return;
      } else {
        // One-way
        if (state.endAddress && state.endAddress.trim().length > 0) {
          // Geocode the typed end address
          const endLoc = await geocodeAddress(state.endAddress.trim());
          destinationName = state.endAddress.trim();
          routeResult = await buildOneWayRoute(activity, startCoord, {
            lat: endLoc.lat,
            lng: endLoc.lng,
          });
        } else {
          // Auto-select destination
          const dest = selectOneWayDestination(
            startCoord.lat,
            startCoord.lng,
            routingTags.join(" ") + " " + state.wishes
          );
          destinationName = dest.name;
          routeResult = await buildOneWayRoute(activity, startCoord, {
            lat: dest.lat,
            lng: dest.lng,
          });
        }
      }

      // Fetch POIs near route end
      const pois = await fetchNearbyPOIs(
        routeResult.endCoord.lat,
        routeResult.endCoord.lng,
        activity,
        500
      );

      onNext({
        routeResult,
        destinationName,
        pois,
        routeError: null,
        routeMessage: null,
        screen: "result",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not build route. Please try again."
      );
    }
  }

  if (error) {
    return (
      <div
        className="h-full overflow-y-auto flex flex-col items-center justify-center max-w-sm mx-auto px-5 step-enter"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <p className="text-sm mb-6 text-center" style={{ color: "var(--fg-muted)" }}>
          {error}
        </p>
        <button
          onClick={() => onNext({ screen: "step5" })}
          className="px-6 py-3 border rounded-xl text-sm font-medium"
          style={{ borderColor: "var(--border)", color: "var(--fg)" }}
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center max-w-sm mx-auto px-5 step-enter"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Spinner */}
      <div
        className="w-6 h-6 border-2 rounded-full animate-spin mb-10"
        style={{
          borderColor: "var(--border)",
          borderTopColor: "var(--fg)",
        }}
      />

      {/* Heading */}
      <p
        className="text-xs uppercase tracking-widest mb-8"
        style={{ color: "var(--fg-subtle)" }}
      >
        Your route is in process
      </p>

      {/* Animated summary word */}
      <div className="h-10 flex items-center justify-center">
        <span
          key={wordKey}
          className="word-slide text-2xl font-light text-center"
          style={{ color: "var(--fg)" }}
        >
          {summaryWords[currentWordIdx]}
        </span>
      </div>
    </div>
  );
}
