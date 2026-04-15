"use client";

import { useEffect, useState } from "react";
import { ThemeType } from "../../types";

interface SplashScreenProps {
  onFinish: () => void;
  theme: ThemeType;
  onThemeToggle: () => void;
}

export default function SplashScreen({ onFinish, theme, onThemeToggle }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2500);
    const t2 = setTimeout(() => onFinish(), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  const isDark = theme === "dark";

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--bg)" }}
    >
      {/* Theme toggle — top right, very subtle */}
      <button
        onClick={onThemeToggle}
        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-300 hover:opacity-70"
        style={{ borderColor: "var(--border)", color: "var(--fg-subtle)" }}
        aria-label="Toggle theme"
      >
        <span className="text-[11px] select-none leading-none">
          {isDark ? "◐" : "◑"}
        </span>
      </button>

      {/* Top tagline */}
      <p
        className="absolute top-14 text-[11px] tracking-[0.3em] uppercase fade-rise"
        style={{ color: "var(--fg-subtle)" }}
      >
        Your space is everywhere
      </p>

      {/* Cycling figure */}
      <div className="cyclist-bounce fade-rise-delay">
        <CyclistSVG />
      </div>

      {/* Logo */}
      <p className="absolute bottom-14 text-sm font-medium tracking-widest fade-rise-delay-2">
        <span style={{ color: "var(--fg-subtle)" }}>s</span>
        <span style={{ color: "var(--fg)" }}>pace</span>
      </p>
    </div>
  );
}

function CyclistSVG() {
  return (
    <svg viewBox="0 0 80 55" width="72" height="50" fill="none" aria-hidden="true">
      {/* Rear wheel rim */}
      <circle cx="18" cy="40" r="11" stroke="#888" strokeWidth="1.8" />
      {/* Rear wheel spokes — rotates */}
      <g className="wheel-left">
        <line x1="18" y1="29" x2="18" y2="51" stroke="#888" strokeWidth="1" />
        <line x1="7" y1="40" x2="29" y2="40" stroke="#888" strokeWidth="1" />
        <line x1="10" y1="32" x2="26" y2="48" stroke="#888" strokeWidth="0.8" />
        <line x1="26" y1="32" x2="10" y2="48" stroke="#888" strokeWidth="0.8" />
      </g>

      {/* Front wheel rim */}
      <circle cx="62" cy="40" r="11" stroke="#888" strokeWidth="1.8" />
      {/* Front wheel spokes — rotates */}
      <g className="wheel-right">
        <line x1="62" y1="29" x2="62" y2="51" stroke="#888" strokeWidth="1" />
        <line x1="51" y1="40" x2="73" y2="40" stroke="#888" strokeWidth="1" />
        <line x1="54" y1="32" x2="70" y2="48" stroke="#888" strokeWidth="0.8" />
        <line x1="70" y1="32" x2="54" y2="48" stroke="#888" strokeWidth="0.8" />
      </g>

      {/* Frame: chain stay */}
      <line x1="18" y1="40" x2="40" y2="40" stroke="#888" strokeWidth="1.5" />
      {/* Frame: seat tube */}
      <line x1="40" y1="40" x2="44" y2="21" stroke="#888" strokeWidth="1.5" />
      {/* Frame: seat stay */}
      <line x1="18" y1="40" x2="44" y2="21" stroke="#888" strokeWidth="1.3" />
      {/* Frame: down tube */}
      <line x1="40" y1="40" x2="62" y2="27" stroke="#888" strokeWidth="1.5" />
      {/* Frame: top tube */}
      <line x1="44" y1="21" x2="62" y2="18" stroke="#888" strokeWidth="1.5" />
      {/* Frame: fork */}
      <line x1="62" y1="18" x2="62" y2="40" stroke="#888" strokeWidth="1.5" />

      {/* Saddle */}
      <line x1="42" y1="19" x2="52" y2="19" stroke="#888" strokeWidth="2" />
      <line x1="44" y1="21" x2="47" y2="19" stroke="#888" strokeWidth="1.2" />

      {/* Handlebar stem */}
      <line x1="62" y1="18" x2="60" y2="13" stroke="#888" strokeWidth="1.5" />
      <line x1="57" y1="13" x2="65" y2="13" stroke="#888" strokeWidth="2" />

      {/* Rider: head */}
      <circle cx="57" cy="8" r="4" fill="#999" />
      {/* Rider: body */}
      <line x1="57" y1="12" x2="51" y2="21" stroke="#999" strokeWidth="1.8" />
      {/* Rider: arms */}
      <line x1="55" y1="16" x2="62" y2="13" stroke="#999" strokeWidth="1.5" />
      {/* Rider: left leg */}
      <line x1="51" y1="21" x2="43" y2="31" stroke="#999" strokeWidth="1.8" />
      <line x1="43" y1="31" x2="40" y2="38" stroke="#999" strokeWidth="1.8" />
      {/* Rider: right leg */}
      <line x1="51" y1="21" x2="55" y2="31" stroke="#999" strokeWidth="1.8" />
      <line x1="55" y1="31" x2="52" y2="37" stroke="#999" strokeWidth="1.8" />
    </svg>
  );
}
