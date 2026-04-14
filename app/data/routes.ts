/**
 * Static UI data: activity parameters and tag labels.
 * Mocked route data has been removed — real routes come from OSRM.
 */

import { ActivityType } from "../types";

export const TAGS = [
  "quiet",
  "green",
  "waterside",
  "flat",            // not yet supported
  "car-free",
  "coffee at the end",
  "shaded",
  "scenic view",
  "good for evenings",
];

export const ACTIVITY_PARAMS: Record<ActivityType, { title: string; options: string[] }> = {
  running: {
    title: "How far do you want to run?",
    options: ["3 km", "5 km", "8 km", "10 km", "Custom"],
  },
  cycling: {
    title: "How far do you want to ride?",
    options: ["10 km", "20 km", "40 km", "60 min", "Custom"],
  },
  walking: {
    title: "What works best for you?",
    options: ["5,000 steps", "8,000 steps", "10,000 steps", "30 min", "60 min", "Custom"],
  },
  yoga: {
    title: "What suits you today?",
    options: [
      "15 min walk to park",
      "30 min gentle walk",
      "A quiet spot nearby",
      "A spot near water",
      "Custom",
    ],
  },
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  running: "Running",
  cycling: "Cycling",
  walking: "Walking",
  yoga: "Yoga in the park",
};
