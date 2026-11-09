// ============================================================
// BreatheIQ — OpenAQ API v3 Client
// All calls are server-side only. API key never reaches browser.
// ============================================================

import type { Station, Measurement, PollutantKey } from "@/types";

const OPENAQ_BASE = "https://api.openaq.org/v3";
const API_KEY = process.env.OPENAQ_API_KEY || "";

// Map OpenAQ parameter names → our internal keys
const PARAM_MAP: Record<string, PollutantKey> = {
  pm25: "pm25",
  "pm2.5": "pm25",
  pm10: "pm10",
  no2: "no2",
  so2: "so2",
  co: "co",
  o3: "o3",
  ozone: "o3",
};

function normalizeUnit(param: string, unit: string): string {
  const p = param.toLowerCase();
  if (p === "co") return "mg/m³";
  return "µg/m³";
}

async function openaqFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${OPENAQ_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 300 }, // 5-minute cache
  });

  if (!res.ok) {
    throw new Error(`OpenAQ API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

/** Find locations (monitoring stations) near lat/lon */
export async function getNearbyLocations(
  lat: number,
  lon: number,
  radius = 25000,
  limit = 10
): Promise<Station[]> {
  const data = await openaqFetch("/locations", {
    coordinates: `${lat},${lon}`,
    radius,
    limit,
    order_by: "distance",
  });

  if (!data?.results) return [];

  return data.results.map((loc: any) => {
    const measurements: Partial<Record<PollutantKey, Measurement>> = {};

    if (loc.sensors) {
      for (const sensor of loc.sensors) {
        const paramName = sensor.parameter?.name?.toLowerCase() || "";
        const key = PARAM_MAP[paramName];
        if (key && sensor.latest?.value !== undefined) {
          measurements[key] = {
            pollutant: key,
            value: sensor.latest.value,
            unit: normalizeUnit(paramName, sensor.parameter?.units || ""),
            timestamp: sensor.latest?.datetime?.utc || new Date().toISOString(),
            source: "openaq",
            stationId: String(loc.id),
            stationName: loc.name,
            coordinates: loc.coordinates
              ? { lat: loc.coordinates.latitude, lon: loc.coordinates.longitude }
              : undefined,
            measurementType: "measured",
          };
        }
      }
    }

    return {
      id: String(loc.id),
      name: loc.name || "Unknown Station",
      coordinates: {
        lat: loc.coordinates?.latitude || lat,
        lon: loc.coordinates?.longitude || lon,
      },
      city: loc.locality || loc.city,
      country: loc.country?.code,
      source: "openaq",
      lastUpdated: loc.datetimeLast?.utc,
      measurements,
    } as Station;
  });
}

/** Search locations by city name */
export async function searchLocationsByCity(city: string, limit = 10): Promise<Station[]> {
  const data = await openaqFetch("/locations", {
    city,
    limit,
  });

  if (!data?.results) return [];

  return data.results.map((loc: any) => {
    const measurements: Partial<Record<PollutantKey, Measurement>> = {};

    if (loc.sensors) {
      for (const sensor of loc.sensors) {
        const paramName = sensor.parameter?.name?.toLowerCase() || "";
        const key = PARAM_MAP[paramName];
        if (key && sensor.latest?.value !== undefined) {
          measurements[key] = {
            pollutant: key,
            value: sensor.latest.value,
            unit: normalizeUnit(paramName, sensor.parameter?.units || ""),
            timestamp: sensor.latest?.datetime?.utc || new Date().toISOString(),
            source: "openaq",
            stationId: String(loc.id),
            stationName: loc.name,
            measurementType: "measured",
          };
        }
      }
    }

    return {
      id: String(loc.id),
      name: loc.name || "Unknown Station",
      coordinates: {
        lat: loc.coordinates?.latitude || 0,
        lon: loc.coordinates?.longitude || 0,
      },
      city: loc.locality || loc.city,
      country: loc.country?.code,
      source: "openaq",
      lastUpdated: loc.datetimeLast?.utc,
      measurements,
    } as Station;
  });
}

/** Get measurements for a specific location */
export async function getLocationMeasurements(
  locationId: string,
  limit = 100
): Promise<Measurement[]> {
  const data = await openaqFetch(`/locations/${locationId}/sensors`);

  if (!data?.results) return [];

  const measurements: Measurement[] = [];
  for (const sensor of data.results) {
    const paramName = sensor.parameter?.name?.toLowerCase() || "";
    const key = PARAM_MAP[paramName];
    if (key && sensor.latest?.value !== undefined) {
      measurements.push({
        pollutant: key,
        value: sensor.latest.value,
        unit: normalizeUnit(paramName, sensor.parameter?.units || ""),
        timestamp: sensor.latest?.datetime?.utc || new Date().toISOString(),
        source: "openaq",
        stationId: locationId,
        measurementType: "measured",
      });
    }
  }
  return measurements;
}

/** Get historical measurements for a sensor */
export async function getSensorHistory(
  sensorId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ datetime: string; value: number }[]> {
  const data = await openaqFetch(`/sensors/${sensorId}/measurements`, {
    datetime_from: dateFrom,
    datetime_to: dateTo,
    limit: 1000,
  });

  if (!data?.results) return [];
  return data.results.map((r: any) => ({
    datetime: r.period?.datetimeTo?.utc || r.datetime?.utc || "",
    value: r.value,
  }));
}

