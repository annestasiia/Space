"use client";

import { useState } from "react";
import { AppState, ActivityType, LocalityType } from "../../types";
import { ACTIVITY_CATEGORIES, WISHES_PLACEHOLDER } from "../../data/routes";
import { SpaceLogo, BackButton } from "./Step1Screen";

interface Step5Props {
  state: AppState;
  onNext: (updates: Partial<AppState>) => void;
  onBack: () => void;
}

export default function Step5Screen({ state, onNext, onBack }: Step5Props) {
  const activity = state.activity as ActivityType;
  const categories = ACTIVITY_CATEGORIES[activity];

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<string[]>(state.selectedTags || []);
  const [wishes, setWishes] = useState(state.wishes || "");
  const [locality, setLocality] = useState<LocalityType>(state.locality || null);
  const [localityOpen, setLocalityOpen] = useState(false);

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleGenerate() {
    onNext({
      selectedTags,
      wishes,
      locality,
      screen: "loading",
    });
  }

  return (
    <div
      className="h-full flex flex-col max-w-sm mx-auto step-enter"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Header */}
      <div className="px-5 pt-10 pb-6 flex items-center justify-between flex-shrink-0">
        <BackButton onClick={onBack} />
        <SpaceLogo />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scroll-smooth px-5 pb-4">
        {/* Question + locality toggle */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <h1
            className="text-[1.75rem] font-light leading-snug"
            style={{ color: "var(--fg)" }}
          >
            What are you<br />looking for today?
          </h1>
          <div className="flex-shrink-0 mt-1">
            <button
              onClick={() => setLocalityOpen((p) => !p)}
              className="text-xs px-3 py-1.5 border rounded-full transition-all duration-150 whitespace-nowrap"
              style={{
                borderColor: locality ? "var(--fg)" : "var(--border)",
                color: locality ? "var(--fg)" : "var(--fg-muted)",
                background: "var(--card-bg)",
              }}
            >
              {locality
                ? locality === "first-time"
                  ? "First time here"
                  : "I'm a local"
                : "New place?"}
            </button>
            {localityOpen && (
              <div
                className="absolute mt-1 border rounded-xl overflow-hidden z-10 shadow-sm"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  right: "20px",
                }}
              >
                {(["first-time", "local"] as LocalityType[]).map((l) => (
                  <button
                    key={l!}
                    onClick={() => {
                      setLocality(l);
                      setLocalityOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm transition-colors"
                    style={{
                      background:
                        locality === l ? "var(--card-bg)" : "var(--bg)",
                      color: "var(--fg)",
                    }}
                  >
                    {l === "first-time" ? "First time here" : "I'm a local"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag categories */}
        <div className="mb-6">
          {Object.entries(categories).map(([cat, subTags]) => {
            const isOpen = openCategories.has(cat);
            const activeCount = subTags.filter((t) => selectedTags.includes(t)).length;

            return (
              <div key={cat} className="mb-2">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {cat}
                    {activeCount > 0 && (
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--card-active-bg)",
                          color: "var(--card-active-fg)",
                        }}
                      >
                        {activeCount}
                      </span>
                    )}
                  </span>
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{
                      color: "var(--fg-subtle)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    ↓
                  </span>
                </button>

                {isOpen && (
                  <div className="flex flex-wrap gap-2 pb-3">
                    {subTags.map((tag) => {
                      const isActive = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="px-3 py-1.5 border rounded-full text-xs font-medium transition-all duration-150"
                          style={{
                            background: isActive
                              ? "var(--card-active-bg)"
                              : "var(--tag-bg)",
                            borderColor: isActive
                              ? "var(--card-active-bg)"
                              : "var(--border)",
                            color: isActive
                              ? "var(--card-active-fg)"
                              : "var(--fg)",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    height: "1px",
                    background: "var(--border-subtle)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Selected tags summary */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs"
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

        {/* Free-text request */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--fg)" }}>
            Any specific request?
          </p>
          <textarea
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder={WISHES_PLACEHOLDER[activity]}
            rows={4}
            className="w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none transition-colors resize-none leading-relaxed"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-6 flex-shrink-0">
        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-2xl text-base font-medium transition-all duration-150"
          style={{
            background: "var(--card-active-bg)",
            color: "var(--card-active-fg)",
          }}
        >
          Generate Route
        </button>
      </div>
    </div>
  );
}
