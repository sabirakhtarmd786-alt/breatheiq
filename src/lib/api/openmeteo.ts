// ============================================================
// BreatheIQ — Open-Meteo Air Quality API Client
// Used for model-based estimates and forecasts.
// NEVER labeled as monitoring station measurements.
// ============================================================

import type { ForecastDay, ForecastHour } from "@/types";

const OPENMETEO_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

export interface OpenMeteoCurrentData {
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  co?: number;
  so2?: number;
  aqi_us?: number;
  time: string;
  source: "openmeteo";
  measurementType: "modeled";
}

export async function getOpenMeteoAirQuality(
  lat: number,
  lon: number
): Promise<{ current: OpenMeteoCurrentData | null; forecast: ForecastDay[] }> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly:
      "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide,us_aqi",
    current: "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide,us_aqi",
    timezone: "auto",
    forecast_days: "5",
  });

  const res = await fetch(`${OPENMETEO_BASE}?${params}`, {
    next: { revalidate: 1800 }, // 30-min cache
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  // --- Current ---
  const c = data.current;
  const currentData: OpenMeteoCurrentData | null = c
    ? {
        pm25: c.pm2_5,
        pm10: c.pm10,
        no2: c.nitrogen_dioxide,
        o3: c.ozone,
        co: c.carbon_monoxide !== undefined ? c.carbon_monoxide / 1000 : undefined, // convert µg/m³ → mg/m³
        so2: c.sulphur_dioxide,
        aqi_us: c.us_aqi,
        time: data.current_units ? c.time : new Date().toISOString(),
        source: "openmeteo",
        measurementType: "modeled",
      }
    : null;

  // --- Forecast ---
  const hourly = data.hourly;
  const forecastDays: ForecastDay[] = [];

  if (hourly?.time) {
    const times: string[] = hourly.time;
    const pm25arr: (number | null)[] = hourly.pm2_5 || [];
    const pm10arr: (number | null)[] = hourly.pm10 || [];
    const no2arr: (number | null)[] = hourly.nitrogen_dioxide || [];
    const o3arr: (number | null)[] = hourly.ozone || [];
    const coarr: (number | null)[] = hourly.carbon_monoxide || [];
    const aqiArr: (number | null)[] = hourly.us_aqi || [];

    // Group by day
    const dayMap = new Map<string, ForecastHour[]>();
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      const day = t.substring(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push({
        time: t,
        pm25: pm25arr[i] ?? undefined,
        pm10: pm10arr[i] ?? undefined,
        no2: no2arr[i] ?? undefined,
        o3: o3arr[i] ?? undefined,
        co: coarr[i] !== null ? (coarr[i]! / 1000) : undefined,
      });
    }

    for (const [date, hours] of dayMap.entries()) {
      const validPm25 = hours.map((h) => h.pm25).filter((v): v is number => v !== undefined);
      const validPm10 = hours.map((h) => h.pm10).filter((v): v is number => v !== undefined);
      const validNo2 = hours.map((h) => h.no2).filter((v): v is number => v !== undefined);

      forecastDays.push({
        date,
        avgPm25: validPm25.length
          ? Math.round((validPm25.reduce((a, b) => a + b, 0) / validPm25.length) * 10) / 10
          : undefined,
        avgPm10: validPm10.length
          ? Math.round(validPm10.reduce((a, b) => a + b, 0) / validPm10.length)
          : undefined,
        avgNo2: validNo2.length
          ? Math.round(validNo2.reduce((a, b) => a + b, 0) / validNo2.length)
          : undefined,
        hours,
      });
    }
  }

  return { current: currentData, forecast: forecastDays };
}

