export type PollutantKey = 'pm2_5' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3';

export type AQICategory = 
  | 'good' 
  | 'moderate' 
  | 'sensitive' 
  | 'unhealthy' 
  | 'veryUnhealthy' 
  | 'hazardous';

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
  standard: 'US_EPA' | 'EAQI';
  calculatedAt: string;
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

export interface LocationData {
  id: string | number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
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
  source: string;
  dataSourceType: DataSourceType;
  stationName?: string;
  stationId?: string;
  stationDistanceKm?: number;
  dataFreshnessMinutes: number;
}

export interface HistoricalDataPoint {
  time: string;
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  aqi: number;
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
