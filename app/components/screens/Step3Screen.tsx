"use client";

import { useState } from "react";
import { AppState, StartType } from "../../types";
import { geocodeAddress, getBrowserLocation } from "../../lib/geocoding";
import { SpaceLogo, BackButton } from "./Step1Screen";

interface Step3Props {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

export default function Step3Screen({ state, onNext, onBack }: Step3Props) {
  const [startType, setStartType] = useState<StartType | null>(null);
  const [address, setAddress] = useState(state.address || "");
  const [isResolving, setIsResolving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const canProceed =
    !isResolving &&
    (startType === "current" || (startType === "address" && address.trim().length > 0));

  async function handleProceed() {
    if (!startType) return;
    // Dismiss keyboard NOW, before any async work, so it is fully
    // closed before Step4 renders — prevents layout shift on transition.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setLocationError(null);
    setIsResolving(true);

    try {
      if (startType === "current") {
        const loc = await getBrowserLocation();
        onNext({
          startType,
          address: "",
          startCoord: { lat: loc.lat, lng: loc.lng },
          startLabel: loc.displayName,
          screen: "step4",
        });
      } else {
        const loc = await geocodeAddress(address.trim());
        onNext({
          startType,
          address: address.trim(),
          startCoord: { lat: loc.lat, lng: loc.lng },
          startLabel: address.trim(),
          screen: "step4",
        });
      }
    } catch (err: unknown) {
      setLocationError(
        err instanceof Error ? err.message : "Could not resolve start location."
      );
    } finally {
      setIsResolving(false);
    }
  }

  function handleSelectType(t: StartType) {
    setStartType(t);
    setLocationError(null);
    if (t === "current") {
      // Auto-proceed for current location
      setIsResolving(true);
      getBrowserLocation()
        .then((loc) => {
          onNext({
            startType: t,
            address: "",
            startCoord: { lat: loc.lat, lng: loc.lng },
            startLabel: loc.displayName,
            screen: "step4",
          });
        })
        .catch((err) => {
          setLocationError(
            err instanceof Error ? err.message : "Could not get location."
          );
          setIsResolving(false);
        });
    }
  }

  return (
    <div
      className="h-full overflow-y-auto flex flex-col max-w-sm mx-auto px-5 step-enter"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Header */}
      <div className="pt-10 pb-8 flex items-center justify-between">
        <BackButton onClick={onBack} />
        <SpaceLogo />
      </div>

      <div className="flex-1">
        <h1
          className="text-[1.75rem] font-light leading-snug mb-8"
          style={{ color: "var(--fg)" }}
        >
          Where do you<br />wanna start?
        </h1>

        <div className="flex flex-col gap-3">
          {/* Current location */}
          <button
            onClick={() => handleSelectType("current")}
            disabled={isResolving}
            className="text-left px-5 py-4 border rounded-2xl transition-all duration-150"
            style={{
              background: startType === "current" ? "var(--card-active-bg)" : "var(--card-bg)",
              borderColor: startType === "current" ? "var(--card-active-bg)" : "var(--border)",
              color: startType === "current" ? "var(--card-active-fg)" : "var(--fg)",
            }}
          >
            <span className="text-base font-medium">
              {isResolving && startType === "current"
                ? "Getting location…"
                : "Use my current location"}
            </span>
          </button>

          {/* Enter address */}
          <button
            onClick={() => {
              setStartType("address");
              setLocationError(null);
            }}
            className="text-left px-5 py-4 border rounded-2xl transition-all duration-150"
            style={{
              background: startType === "address" ? "var(--card-bg)" : "var(--card-bg)",
              borderColor:
                startType === "address" ? "var(--fg)" : "var(--border)",
              color: "var(--fg)",
            }}
          >
            <span className="text-base font-medium">Enter an address</span>
          </button>
        </div>

        {/* Address input */}
        {startType === "address" && (
          <div className="mt-4">
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setLocationError(null);
              }}
              placeholder="Street, place or landmark in Weimar"
              className="w-full px-4 py-3.5 border rounded-xl text-base focus:outline-none transition-colors"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canProceed) handleProceed();
              }}
            />
          </div>
        )}

        {locationError && (
          <p
            className="mt-3 text-sm px-4 py-3 border rounded-xl"
            style={{
              color: "var(--fg-muted)",
              borderColor: "var(--border)",
              background: "var(--card-bg)",
            }}
          >
            {locationError}
          </p>
        )}
      </div>

      {/* CTA — only shown for address mode */}
      {startType === "address" && (
        <div className="py-6">
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-150"
            style={{
              background: canProceed ? "var(--card-active-bg)" : "var(--tag-bg)",
              color: canProceed ? "var(--card-active-fg)" : "var(--fg-subtle)",
              cursor: canProceed ? "pointer" : "default",
            }}
          >
            {isResolving ? "Locating…" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
