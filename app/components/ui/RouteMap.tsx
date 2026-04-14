"use client";

import { ActivityType } from "../../types";

interface RouteMapProps {
  activity: ActivityType;
  mapPath: string;
}

const GRID_SIZE = 380;
const GRID_STEP = 38;

export default function RouteMap({ activity, mapPath }: RouteMapProps) {
  const gridLines = [];
  for (let i = GRID_STEP; i < GRID_SIZE; i += GRID_STEP) {
    gridLines.push(
      <line key={`h${i}`} x1="0" y1={i} x2={GRID_SIZE} y2={i} stroke="#f0f0f0" strokeWidth="1" />,
      <line key={`v${i}`} x1={i} y1="0" x2={i} y2={GRID_SIZE} stroke="#f0f0f0" strokeWidth="1" />
    );
  }

  const dotPositions: Record<ActivityType, { cx: number; cy: number; label: string }[]> = {
    running: [
      { cx: 60, cy: 200, label: "Старт" },
      { cx: 270, cy: 150, label: "Парк" },
      { cx: 290, cy: 240, label: "Финиш" },
    ],
    cycling: [
      { cx: 50, cy: 180, label: "Старт" },
      { cx: 200, cy: 90, label: "Набережная" },
      { cx: 330, cy: 210, label: "Финиш" },
    ],
    walking: [
      { cx: 80, cy: 220, label: "Старт" },
      { cx: 200, cy: 115, label: "Парк" },
      { cx: 275, cy: 250, label: "Финиш" },
    ],
    yoga: [
      { cx: 140, cy: 160, label: "Старт" },
      { cx: 245, cy: 225, label: "Парк" },
    ],
  };

  const dots = dotPositions[activity];

  return (
    <div className="w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
      <svg
        viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
        className="w-full h-auto"
        style={{ maxHeight: 380 }}
      >
        {/* Grid */}
        {gridLines}

        {/* Route path */}
        <path
          d={mapPath}
          fill="none"
          stroke="#171717"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
          opacity="0.85"
        />

        {/* Direction arrows on path - simplified as dots */}
        {dots.map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={i === 0 ? 6 : 5}
              fill={i === 0 ? "#171717" : "white"}
              stroke="#171717"
              strokeWidth="2"
            />
            <text
              x={dot.cx + 10}
              y={dot.cy + 4}
              fontSize="10"
              fill="#6b7280"
              fontFamily="system-ui, sans-serif"
            >
              {dot.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
