// API Route: POST /api/comparison
// Body: { locations: [{ lat, lon, name }] }
import { NextResponse } from "next/server";
import { getNearbyLocations } from "@/lib/api/openaq";
import { getOpenMeteoAirQuality } from "@/lib/api/openmeteo";
import { calculateAQI } from "@/lib/aqi/calculator";
import type { PollutantKey, Measurement, AirQualityData } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();
  const locations: { lat: number; lon: number; name: string }[] = body.locations || [];

  if (locations.length < 2 || locations.length > 4) {
    return NextResponse.json({ error: "Provide 2–4 locations" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    locations.map(async (loc) => {
      const [stations, meteo] = await Promise.allSettled([
        getNearbyLocations(loc.lat, loc.lon, 25000, 5),
        getOpenMeteoAirQuality(loc.lat, loc.lon),
      ]);

      const stationsData = stations.status === "fulfilled" ? stations.value : [];
      const meteoData = meteo.status === "fulfilled" ? meteo.value : null;

      const measurements: Partial<Record<PollutantKey, Measurement>> = {};
      const pollutants: PollutantKey[] = ["pm25", "pm10", "no2", "so2", "co", "o3"];

      for (const station of stationsData) {
        for (const p of pollutants) {
          if (!measurements[p] && station.measurements[p]) {
            measurements[p] = station.measurements[p]!;
          }
        }
      }

      if (meteoData?.current) {
        const c = meteoData.current;
        const meteoMap: Partial<Record<PollutantKey, number | undefined>> = {
          pm25: c.pm25, pm10: c.pm10, no2: c.no2, o3: c.o3, co: c.co, so2: c.so2,
        };
        for (const [key, val] of Object.entries(meteoMap)) {
          const p = key as PollutantKey;
          if (!measurements[p] && val !== undefined) {
            measurements[p] = { pollutant: p, value: val, unit: p === "co" ? "mg/m³" : "µg/m³",
              timestamp: c.time, source: "openmeteo", measurementType: "modeled" };
          }
        }
      }

      return {
        location: { name: loc.name, coordinates: { lat: loc.lat, lon: loc.lon } },
        measurements,
        aqi: calculateAQI(measurements),
        stationCount: stationsData.length,
      };
    })
  );

  const data = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { location: locations[i], measurements: {}, aqi: { value: 0, category: "Unknown", calculated: false }, stationCount: 0, error: (r as any).reason?.message }
  );

  return NextResponse.json({
    data,
    fetchedAt: new Date().toISOString(),
    note: "Data from different stations may have different measurement times. Direct comparison should be interpreted carefully.",
  });
}

