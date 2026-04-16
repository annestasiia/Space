"use client";

import { useState } from "react";
import { AppState, ActivityType, DistOrDur } from "../../types";
import { ACTIVITY_QUESTIONS, DISTANCE_OPTIONS, DURATION_OPTIONS } from "../../data/routes";
import { SpaceLogo, BackButton } from "./Step1Screen";

interface Step2Props {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

export default function Step2Screen({ state, onNext, onBack }: Step2Props) {
  const activity = state.activity as ActivityType;
  const [mode, setMode] = useState<DistOrDur | null>(null);
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");

  const options = mode === "distance" ? DISTANCE_OPTIONS : DURATION_OPTIONS;
  const effectiveParam = selected === "Custom" ? custom.trim() : selected;
  const canContinue = effectiveParam.length > 0;

  function handleSelect(opt: string) {
    setSelected(opt);
    if (opt !== "Custom") {
      // Auto-advance
      setTimeout(() => {
        onNext({
          distOrDur: mode!,
          mainParam: opt,
          customParam: "",
          screen: "step3",
        });
      }, 180);
    }
  }

  function handleContinue() {
    if (!canContinue) return;
    onNext({
      distOrDur: mode!,
      mainParam: effectiveParam,
      customParam: selected === "Custom" ? custom.trim() : "",
      screen: "step3",
    });
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
        {/* Question */}
        <h1
          className="text-[1.75rem] font-light leading-snug mb-8"
          style={{ color: "var(--fg)" }}
        >
          {ACTIVITY_QUESTIONS[activity]}
        </h1>

        {/* Mode selector */}
        {!mode && (
          <div className="grid grid-cols-2 gap-3">
            {(["distance", "duration"] as DistOrDur[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="py-5 border rounded-2xl text-base font-medium transition-all duration-150"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                {m === "distance" ? "Distance" : "Duration"}
              </button>
            ))}
          </div>
        )}

        {/* Options once mode is selected */}
        {mode && (
          <>
            {/* Sub-heading */}
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--fg-subtle)" }}>
              {mode === "distance" ? "How far?" : "How long?"}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {options.map((opt) => {
                const isActive = selected === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="px-4 py-2.5 border rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background: isActive ? "var(--card-active-bg)" : "var(--card-bg)",
                      borderColor: isActive ? "var(--card-active-bg)" : "var(--border)",
                      color: isActive ? "var(--card-active-fg)" : "var(--fg)",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected === "Custom" && (
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={mode === "distance" ? 'e.g. "7 km"' : 'e.g. "45 min"'}
                autoFocus
                className="w-full px-4 py-3.5 border rounded-xl text-base focus:outline-none transition-colors"
                style={{
                  background: "var(--input-bg)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              />
            )}

            <button
              onClick={() => setMode(null)}
              className="mt-4 text-xs transition-opacity hover:opacity-60"
              style={{ color: "var(--fg-subtle)" }}
            >
              ← Change mode
            </button>
          </>
        )}
      </div>

      {/* CTA — only shown for Custom input */}
      {mode && selected === "Custom" && (
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
