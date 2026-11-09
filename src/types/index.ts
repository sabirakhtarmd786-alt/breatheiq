// ============================================================
// BreatheIQ — Core Type Definitions
// ============================================================

export type PollutantKey = "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";

export interface Pollutant {
  key: PollutantKey;
  name: string;
  fullName: string;
  unit: string;
  description: string;
}

export interface Measurement {
  pollutant: PollutantKey;
  value: number;
  unit: string;
  timestamp: string; // ISO 8601
  source: "openaq" | "openmeteo" | "demo";
  stationId?: string;
  stationName?: string;
  coordinates?: { lat: number; lon: number };
  measurementType: "measured" | "modeled" | "forecast";
}

export interface AQIResult {
  value: number;
  category: AQICategory;
  color: string;
  textColor: string;
  dominantPollutant: PollutantKey | null;
  standard: "US-EPA";
  calculated: boolean; // false if insufficient data
  message?: string;
}

export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous"
  | "Unknown";

export interface Station {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number };
  city?: string;
  country?: string;
  source: string;
  lastUpdated?: string;
  measurements: Partial<Record<PollutantKey, Measurement>>;
}

export interface LocationInfo {
  name: string;
  city?: string;
  country?: string;
  coordinates: { lat: number; lon: number };
}

export interface ForecastHour {
  time: string; // ISO 8601
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  co?: number;
  so2?: number;
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  avgPm25?: number;
  avgPm10?: number;
  avgNo2?: number;
  maxAqi?: number;
  hours: ForecastHour[];
}

export interface AirQualityData {
  location: LocationInfo;
  measurements: Partial<Record<PollutantKey, Measurement>>;
  aqi: AQIResult;
  stations: Station[];
  dataSource: string;
  fetchedAt: string;
  isDemo: boolean;
}

export interface HistoricalEntry {
  timestamp: string;
  pollutant: PollutantKey;
  value: number;
  unit: string;
  source: string;
}

export interface ComparisonLocation {
  id: string;
  locationInfo: LocationInfo;
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
}

export interface Alert {
  id: string;
  pollutant: PollutantKey;
  threshold: number;
  unit: string;
  enabled: boolean;
  triggeredAt?: string;
  currentValue?: number;
  locationName?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemo: boolean;
  fetchedAt: string;
}

export interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  coordinates: { lat: number; lon: number };
  country?: string;
  type: "city" | "station";
}

