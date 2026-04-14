export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteResult {
  geometry: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  startCoord: Coordinate;
  endCoord: Coordinate;
  isRoundtrip: boolean;
}

export interface POIResult {
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}
