"use client";

import { useState } from "react";
import { ActivityType, AppState } from "../../types";

interface Step1Props {
  onNext: (updates: Partial<AppState>) => void;
}

const activities: { id: ActivityType; label: string; description: string }[] = [
  { id: "running", label: "Running", description: "Track, park, trail" },
  { id: "walking", label: "Walking", description: "A walk at your own pace" },
  { id: "cycling", label: "Cycling", description: "Bike lanes and routes" },
  { id: "other", label: "Other", description: "Any kind of movement" },
];

export default function Step1Screen({ onNext }: Step1Props) {
  const [selected, setSelected] = useState<ActivityType | null>(null);

  function handleSelect(id: ActivityType) {
    setSelected(id);
    // Auto-advance after a short delay for smooth feel
    setTimeout(() => {
      onNext({ activity: id, screen: "step2" });
    }, 180);
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col max-w-sm mx-auto px-5 step-enter"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Header */}
      <div className="pt-10 pb-10">
        <SpaceLogo />
      </div>

      {/* Question */}
      <div className="flex-1">
        <h1
          className="text-[2rem] font-light leading-tight mb-10"
          style={{ color: "var(--fg)" }}
        >
          What is your pace<br />for today?
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {activities.map((a) => {
            const isActive = selected === a.id;
            return (
              <button
                key={a.id}
                onClick={() => handleSelect(a.id)}
                className="text-left p-5 border rounded-2xl transition-all duration-150"
                style={{
                  background: isActive ? "var(--card-active-bg)" : "var(--card-bg)",
                  borderColor: isActive ? "var(--card-active-bg)" : "var(--border)",
                  color: isActive ? "var(--card-active-fg)" : "var(--fg)",
                }}
              >
                <div className="text-base font-medium mb-1">{a.label}</div>
                <div
                  className="text-xs leading-snug"
                  style={{
                    color: isActive ? "rgba(255,255,255,0.5)" : "var(--fg-muted)",
                  }}
                >
                  {a.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo note */}
      <p className="text-center text-xs pb-8" style={{ color: "var(--fg-subtle)" }}>
        Demo available for Weimar, Thuringia
      </p>
    </div>
  );
}

export function SpaceLogo() {
  return (
    <span className="text-sm font-medium tracking-widest select-none">
      <span style={{ color: "var(--fg-subtle)" }}>s</span>
      <span style={{ color: "var(--fg)" }}>pace</span>
    </span>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm transition-opacity duration-150 hover:opacity-60"
      style={{ color: "var(--fg-muted)" }}
    >
      ← Back
    </button>
  );
}
