import { ActivityType } from "../types";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  running: "Running",
  walking: "Walking",
  cycling: "Cycling",
  other: "Other",
};

export const ACTIVITY_QUESTIONS: Record<ActivityType, string> = {
  running: "How would you like to set up your run today?",
  walking: "How would you like to plan your walk today?",
  cycling: "How would you like to plan your ride today?",
  other: "How would you like to plan your activity today?",
};

export const DISTANCE_OPTIONS = ["1 km", "3 km", "5 km", "Custom"];
export const DURATION_OPTIONS = ["15 min", "30 min", "1 hour", "Custom"];

export const WISHES_PLACEHOLDER: Record<ActivityType, string> = {
  walking:
    "I'm new to the city and want to see the highlights — cafés, squares, anything beautiful. I have about 2 hours.",
  running:
    "I want to run somewhere quiet, away from traffic — trails or a park would be perfect.",
  cycling:
    "Mix of park and city would be great — I want to feel the city but also get some fresh air.",
  other: "Tell me what kind of experience you're looking for...",
};

// Tag categories shown per activity (expandable chips in Step 5)
export const ACTIVITY_CATEGORIES: Record<ActivityType, Record<string, string[]>> = {
  running: {
    Terrain: ["Trail", "Gravel", "Flat road", "Hills", "Track"],
    Nature: ["Park", "Forest", "River", "Lake", "Green path"],
    Vibe: ["Quiet streets", "Crowd-free", "Early morning feel", "Local area"],
  },
  walking: {
    Culture: ["Landmarks", "Architecture", "Street art", "Old town", "Museums"],
    Coffee: ["Coffee shop", "Outdoor café", "Specialty roaster"],
    Food: ["Restaurant", "Market", "Bakery", "Street food"],
    Nature: ["Park", "River", "Lake", "Green path"],
    Vibe: ["Quiet streets", "Crowd-free", "Local area"],
  },
  cycling: {
    Terrain: ["Bike lane", "Trail", "Gravel", "Flat road", "Hills"],
    Nature: ["Park", "Forest", "River", "Lake"],
    Culture: ["Landmarks", "Architecture", "Old town", "Street art"],
    Vibe: ["Quiet streets", "Crowd-free", "Scenic route", "Local area"],
  },
  other: {
    Terrain: ["Trail", "Gravel", "Flat road", "Hills", "Track"],
    Nature: ["Park", "Forest", "River", "Lake", "Green path"],
    Culture: ["Landmarks", "Architecture", "Street art", "Old town", "Museums"],
    Coffee: ["Coffee shop", "Outdoor café", "Specialty roaster"],
    Food: ["Restaurant", "Market", "Bakery", "Street food"],
    Vibe: ["Quiet streets", "Crowd-free", "Early morning feel", "Local area"],
  },
};

// Maps new sub-tags → legacy routing tags used by weimar.ts scoring
export const TAG_TO_ROUTING: Record<string, string[]> = {
  Trail: ["green"],
  Gravel: ["green"],
  "Flat road": [],
  Hills: [],
  Track: [],
  "Bike lane": ["car-free"],
  Park: ["green"],
  Forest: ["green", "shaded"],
  River: ["waterside"],
  Lake: ["waterside"],
  "Green path": ["green"],
  "Quiet streets": ["quiet"],
  "Crowd-free": ["quiet", "car-free"],
  "Early morning feel": ["quiet"],
  "Local area": [],
  Landmarks: ["scenic view"],
  Architecture: ["scenic view"],
  "Street art": ["scenic view"],
  "Old town": ["scenic view"],
  Museums: [],
  "Coffee shop": ["coffee at the end"],
  "Outdoor café": ["coffee at the end"],
  "Specialty roaster": ["coffee at the end"],
  Restaurant: [],
  Market: [],
  Bakery: [],
  "Street food": [],
  "Scenic route": ["scenic view"],
};
