import { Coordinate, RouteResult, POIResult } from "./route";

export type ActivityType = "running" | "walking" | "cycling" | "other";
export type StartType = "current" | "address";
export type RouteType = "loop" | "one-way";
export type DistOrDur = "distance" | "duration";
export type LocalityType = "first-time" | "local" | null;
export type ThemeType = "light" | "dark";

export interface AppState {
  screen: "splash" | "step1" | "step2" | "step3" | "step4" | "step5" | "loading" | "result";
  theme: ThemeType;
  activity: ActivityType | null;
  distOrDur: DistOrDur | null;
  mainParam: string;
  customParam: string;
  startType: StartType | null;
  address: string;
  startCoord: Coordinate | null;
  startLabel: string;
  routeType: RouteType | null;
  endAddress: string;
  locality: LocalityType;
  selectedCategories: string[];
  selectedTags: string[];
  wishes: string;
  routeResult: RouteResult | null;
  destinationName: string;
  pois: POIResult[];
  routeError: string | null;
}

export type { Coordinate, RouteResult, POIResult };
