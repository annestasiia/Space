"use client";

import { useState } from "react";
import { AppState, RouteType } from "../../types";
import { SpaceLogo, BackButton } from "./Step1Screen";

interface Step4Props {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

export default function Step4Screen({ state, onNext, onBack }: Step4Props) {
  const [routeType, setRouteType] = useState<RouteType | null>(null);
  const [endMode, setEndMode] = useState<"type" | "map" | null>(null);
  const [endAddress, setEndAddress] = useState(state.endAddress || "");

  const canContinue =
    routeType === "loop" ||
    (routeType === "one-way" && endMode === "map") ||
    (routeType === "one-way" && endMode === "type" && endAddress.trim().length > 0);

  function handleLoop() {
    setRouteType("loop");
    setTimeout(() => {
      onNext({ routeType: "loop", endAddress: "", screen: "step5" });
    }, 180);
  }

  function handleContinue() {
    if (!canContinue) return;
    onNext({
      routeType: routeType!,
      endAddress: endMode === "type" ? endAddress.trim() : "",
      screen: "step5",
    });
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col max-w-sm mx-auto px-5 step-enter"
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
          Route type
        </h1>

        <div className="flex flex-col gap-3">
          {/* Loop */}
          <button
            onClick={handleLoop}
            className="text-left px-5 py-5 border rounded-2xl transition-all duration-150"
            style={{
              background: routeType === "loop" ? "var(--card-active-bg)" : "var(--card-bg)",
              borderColor: routeType === "loop" ? "var(--card-active-bg)" : "var(--border)",
              color: routeType === "loop" ? "var(--card-active-fg)" : "var(--fg)",
            }}
          >
            <div className="text-base font-medium mb-1">Loop</div>
            <div
              className="text-xs"
              style={{
                color:
                  routeType === "loop"
                    ? "rgba(255,255,255,0.5)"
                    : "var(--fg-muted)",
              }}
            >
              Returns to your starting point
            </div>
          </button>

          {/* One way */}
          <button
            onClick={() => {
              setRouteType("one-way");
              setEndMode(null);
            }}
            className="text-left px-5 py-5 border rounded-2xl transition-all duration-150"
            style={{
              background:
                routeType === "one-way" ? "var(--card-bg)" : "var(--card-bg)",
              borderColor:
                routeType === "one-way" ? "var(--fg)" : "var(--border)",
              color: "var(--fg)",
            }}
          >
            <div className="text-base font-medium mb-1">One way</div>
            <div className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Go from A to B
            </div>
          </button>
        </div>

        {/* One-way sub-options */}
        {routeType === "one-way" && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg-subtle)" }}>
              Where to?
            </p>

            <button
              onClick={() => setEndMode("type")}
              className="text-left px-5 py-4 border rounded-2xl transition-all duration-150"
              style={{
                background: endMode === "type" ? "var(--tag-bg)" : "var(--card-bg)",
                borderColor: endMode === "type" ? "var(--fg)" : "var(--border)",
                color: "var(--fg)",
              }}
            >
              <span className="text-sm font-medium">Type address</span>
            </button>

            <button
              onClick={() => setEndMode("map")}
              className="text-left px-5 py-4 border rounded-2xl transition-all duration-150"
              style={{
                background: endMode === "map" ? "var(--tag-bg)" : "var(--card-bg)",
                borderColor: endMode === "map" ? "var(--fg)" : "var(--border)",
                color: "var(--fg)",
              }}
            >
              <span className="text-sm font-medium">Choose on map</span>
              <span className="ml-2 text-xs" style={{ color: "var(--fg-subtle)" }}>
                (auto-select)
              </span>
            </button>

            {endMode === "type" && (
              <input
                type="text"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
                placeholder="Destination address in Weimar"
                autoFocus
                className="mt-1 w-full px-4 py-3.5 border rounded-xl text-base focus:outline-none transition-colors"
                style={{
                  background: "var(--input-bg)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue) handleContinue();
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* CTA — shown when one-way is selected */}
      {routeType === "one-way" && (
        <div className="py-6">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-150"
            style={{
              background: canContinue ? "var(--card-active-bg)" : "var(--tag-bg)",
              color: canContinue ? "var(--card-active-fg)" : "var(--fg-subtle)",
              cursor: canContinue ? "pointer" : "default",
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
