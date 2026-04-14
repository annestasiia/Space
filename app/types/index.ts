import { Coordinate, RouteResult, POIResult } from "./route";

export type ActivityType = "running" | "cycling" | "walking" | "yoga";

export type StartType = "location" | "address";

export interface AppState {
  screen: "activity" | "parameters" | "result";
  activity: ActivityType | null;
  startType: StartType | null;
  address: string;
  startCoord: Coordinate | null;
  startLabel: string;
  mainParam: string;
  customParam: string;
  tags: string[];
  wishes: string;
  routeResult: RouteResult | null;
  destinationName: string;
  pois: POIResult[];
  routeError: string | null;
}

export type { Coordinate, RouteResult, POIResult };
