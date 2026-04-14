"use client";

import { useState } from "react";
import { ActivityType, AppState, StartType } from "../../types";
import { geocodeAddress, getBrowserLocation } from "../../lib/geocoding";

interface ActivityScreenProps {
  onNext: (updates: Partial<AppState>) => void;
}

const activities: { id: ActivityType; label: string; description: string }[] = [
  { id: "running",  label: "Running",          description: "Track, waterfront, park" },
  { id: "cycling",  label: "Cycling",           description: "Bike lanes and routes" },
  { id: "walking",  label: "Walking",           description: "A walk at your own pace" },
  { id: "yoga",     label: "Yoga in the park",  description: "A quiet spot in nature" },
];

function SpaceLogo() {
  return (
    <span className="text-sm font-medium tracking-widest select-none">
      <span className="text-neutral-400">s</span>
      <span className="text-neutral-900">pace</span>
    </span>
  );
}

export default function ActivityScreen({ onNext }: ActivityScreenProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [startType, setStartType] = useState<StartType | null>(null);
  const [address, setAddress] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const hasStart = startType === "location" || (startType === "address" && address.trim().length > 0);
  const canProceed = selectedActivity && hasStart && !isResolving;

  async function handleProceed() {
    if (!selectedActivity || !startType) return;
    setLocationError(null);
    setIsResolving(true);

    try {
      if (startType === "location") {
        const loc = await getBrowserLocation();
        onNext({
          activity: selectedActivity,
          startType,
          address: "",
          startCoord: { lat: loc.lat, lng: loc.lng },
          startLabel: loc.displayName,
          screen: "parameters",
        });
      } else {
        const loc = await geocodeAddress(address.trim());
        onNext({
          activity: selectedActivity,
          startType,
          address: address.trim(),
          startCoord: { lat: loc.lat, lng: loc.lng },
          startLabel: address.trim(),
          screen: "parameters",
        });
      }
    } catch (err: unknown) {
      setLocationError(err instanceof Error ? err.message : "Could not resolve start location.");
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Brand */}
        <div className="mb-14">
          <div className="mb-6"><SpaceLogo /></div>
          <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 leading-snug">
            Where do you want<br />to move today?
          </h1>
        </div>

        {/* Activity cards */}
        <div className="grid grid-cols-2 gap-3 mb-14">
          {activities.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedActivity(a.id)}
              className={`text-left p-5 border rounded-xl transition-all duration-150
                ${selectedActivity === a.id
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
            >
              <div className={`text-lg font-medium mb-1 transition-colors
                ${selectedActivity === a.id ? "text-white" : "text-neutral-900"}`}>
                {a.label}
              </div>
              <div className={`text-sm transition-colors
                ${selectedActivity === a.id ? "text-neutral-400" : "text-neutral-500"}`}>
                {a.description}
              </div>
            </button>
          ))}
        </div>

        {/* Start selection */}
        <div className="mb-12">
          <h2 className="text-xl font-light text-neutral-900 mb-5">Where do we start?</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStartType("location"); setLocationError(null); }}
              className={`text-left px-5 py-4 border rounded-xl transition-all duration-150
                ${startType === "location"
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-400"
                }`}
            >
              <span className={`text-base font-medium transition-colors
                ${startType === "location" ? "text-neutral-900" : "text-neutral-700"}`}>
                Use my current location
              </span>
            </button>
            <button
              onClick={() => { setStartType("address"); setLocationError(null); }}
              className={`text-left px-5 py-4 border rounded-xl transition-all duration-150
                ${startType === "address"
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-400"
                }`}
            >
              <span className={`text-base font-medium transition-colors
                ${startType === "address" ? "text-neutral-900" : "text-neutral-700"}`}>
                Enter an address
              </span>
            </button>
          </div>

          {startType === "address" && (
            <div className="mt-4">
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setLocationError(null); }}
                placeholder="Street, building number, or place in Weimar"
                className="w-full px-5 py-4 border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && canProceed) handleProceed(); }}
              />
            </div>
          )}

          {locationError && (
            <p className="mt-3 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
              {locationError}
            </p>
          )}
        </div>

        {/* Demo note */}
        <p className="text-xs text-neutral-400 mb-6 text-center">
          Live demo available for Weimar, Thuringia only
        </p>

        {/* CTA */}
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`w-full py-4 rounded-xl text-base font-medium transition-all duration-150
            ${canProceed
              ? "bg-neutral-900 text-white hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }`}
        >
          {isResolving ? "Locating…" : "Choose parameters"}
        </button>
      </div>
    </div>
  );
}
