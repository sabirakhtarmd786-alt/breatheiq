export type PollutantKey = 'pm2_5' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3';
export type AnyPollutantKey = PollutantKey | 'pm25';

export type AQICategory = 
  | 'good' 
  | 'moderate' 
  | 'sensitive' 
  | 'unhealthy' 
  | 'veryUnhealthy' 
  | 'hazardous'
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Unknown';

export interface AQICategoryInfo {
  category: AQICategory;
  label: string;
  min: number;
  max: number;
  color: string;
  hex: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  healthAdvisory: string;
}

export interface AQIResult {
  value: number;
  category: AQICategory;
  label: string;
  color: string;
  textColor: string;
  bgLight: string;
  description: string;
  dominantPollutant: PollutantKey;
  standard: 'US_EPA' | 'EAQI' | 'US-EPA' | 'IN_NAAQI' | string;
  calculatedAt: string;
  calculated?: boolean;
}

export interface Pollutant {
  name: string;
  formula?: string;
  chemicalFormula?: string;
  fullName?: string;
  unit: string;
  description?: string;
  category?: AQICategory;
  whoThreshold?: number;
  epaThreshold?: number;
  sources?: string[];
  healthEffects?: string;
  [key: string]: any;
}

export interface PollutantMeasurement {
  key: PollutantKey;
  name: string;
  chemicalFormula: string;
  value: number;
  unit: string;
  aqiValue: number;
  category: AQICategory;
  whoThreshold: number; // 24-hr guideline in ug/m3
  epaThreshold: number; // National ambient air standard
  description: string;
  sources: string[];
  healthEffects: string;
}

export interface Measurement {
  value: number;
  unit: string;
  aqi?: number;
  category?: AQICategory;
  lastUpdated?: string;
  timestamp?: string;
  source?: string;
  measurementType?: string;
  pollutant?: PollutantKey | string;
  [key: string]: any;
}

export interface Station {
  id: string | number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lon: number;
  };
  aqi?: number;
  status?: string;
  pollutants?: Record<string, any>;
  measurements?: Record<string, any>;
  lastUpdated?: string;
  distance?: number;
  distanceKm?: number;
  source?: string;
  [key: string]: any;
}

export interface LocationData {
  id?: string | number;
  name: string;
  city?: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lon: number };
  timezone?: string;
  elevation?: number;
  isUserLocation?: boolean;
}

export type DataSourceType = 'ground_station' | 'atmospheric_model' | 'demo';

export interface AirQualityData {
  location: LocationData;
  timestamp: string;
  aqi: AQIResult;
  pollutants: Record<PollutantKey, PollutantMeasurement>;
  measurements?: Record<string, any>;
  source: string;
  dataSourceType: DataSourceType;
  stationName?: string;
  stationId?: string;
  stationDistanceKm?: number;
  dataFreshnessMinutes: number;
  weather?: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: number;
  };
  sparkline?: number[];
  fetchedAt?: string;
  dataSource?: string;
  stations?: Station[];
  hourlyData?: HistoricalDataPoint[];
  isDemo?: boolean;
  [key: string]: any;
}

export interface HistoricalDataPoint {
  time: string;
  pm2_5?: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  aqi: number;
}

export interface ForecastHour {
  time: string;
  pm2_5?: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  co?: number;
  aqi?: number;
  [key: string]: any;
}

export interface ForecastDay {
  date: string;
  dayLabel?: string;
  aqi?: number;
  minAQI?: number;
  maxAQI?: number;
  dominantPollutant?: PollutantKey;
  hourly?: ForecastHour[];
  hours?: ForecastHour[];
  summary?: string;
  category?: AQICategory;
  [key: string]: any;
}

export interface ForecastDataPoint {
  time: string;
  dayLabel: string;
  dateStr: string;
  aqi: number;
  category: AQICategory;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  summary: string;
}

export type NavigationTab = 
  | 'overview' 
  | 'map' 
  | 'analytics' 
  | 'comparison' 
  | 'health' 
  | 'forecast' 
  | 'clean-air' 
  | 'assistant' 
  | 'alerts' 
  | 'settings';

export interface AlertThresholdConfig {
  id: string;
  pollutant: PollutantKey | 'aqi';
  operator: 'gt' | 'gte';
  threshold: number;
  enabled: boolean;
  notifyBrowser: boolean;
}

export interface Alert {
  id: string;
  title?: string;
  message?: string;
  pollutant: PollutantKey | string;
  threshold?: number;
  currentValue?: number;
  unit?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning';
  timestamp?: string;
  createdAt?: string;
  triggeredAt?: string;
  enabled?: boolean;
  active?: boolean;
  [key: string]: any;
}

export interface InAppAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  pollutant?: string;
  value?: number;
  threshold?: number;
}
