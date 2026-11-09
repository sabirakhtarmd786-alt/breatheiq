// ============================================================
// API Route: GET /api/air-quality?lat=&lon=&city=
// Returns real OpenAQ data or demo data if API unavailable
// ============================================================

import { NextResponse } from "next/server";
import { getNearbyLocations, searchLocationsByCity } from "@/lib/api/openaq";
import { getOpenMeteoAirQuality } from "@/lib/api/openmeteo";
import { calculateAQI } from "@/lib/aqi/calculator";
import { DEMO_AIR_QUALITY } from "@/lib/data/demo";
import type { AirQualityData, PollutantKey, Measurement } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");

  // Coordinates are required (or city fallback)
  if (!lat && !lon && !city) {
    return NextResponse.json(
      { error: "Provide lat/lon or city parameter" },
      { status: 400 }
    );
  }

  // Parse coordinates
  let latitude = lat ? parseFloat(lat) : null;
  let longitude = lon ? parseFloat(lon) : null;

  try {
    // If only city provided, geocode via Nominatim
    if (city && (!latitude || !longitude)) {
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { "User-Agent": "BreatheIQ/1.0" } }
      );
      const geocodeData = await geocodeRes.json();
      if (geocodeData.length > 0) {
        latitude = parseFloat(geocodeData[0].lat);
        longitude = parseFloat(geocodeData[0].lon);
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { data: DEMO_AIR_QUALITY, isDemo: true, fetchedAt: new Date().toISOString() }
      );
    }

    // Fetch both sources in parallel
    const [stations, openMeteoData] = await Promise.allSettled([
      getNearbyLocations(latitude, longitude, 25000, 10),
      getOpenMeteoAirQuality(latitude, longitude),
    ]);

    const stationsData = stations.status === "fulfilled" ? stations.value : [];
    const meteoData =
      openMeteoData.status === "fulfilled" ? openMeteoData.value : null;

    // Aggregate measurements from nearest stations
    const aggregatedMeasurements: Partial<Record<PollutantKey, Measurement>> = {};
    const pollutantOrder: PollutantKey[] = ["pm25", "pm10", "no2", "so2", "co", "o3"];

    // Try to get one reading per pollutant from the nearest available station
    for (const station of stationsData) {
      for (const p of pollutantOrder) {
        if (!aggregatedMeasurements[p] && station.measurements[p]) {
          aggregatedMeasurements[p] = station.measurements[p]!;
        }
      }
    }

    // Supplement missing pollutants from Open-Meteo (clearly labeled modeled)
    if (meteoData?.current) {
      const c = meteoData.current;
      const meteoMap: Partial<Record<PollutantKey, number | undefined>> = {
        pm25: c.pm25,
        pm10: c.pm10,
        no2: c.no2,
        o3: c.o3,
        co: c.co,
        so2: c.so2,
      };
      for (const [key, val] of Object.entries(meteoMap)) {
        const p = key as PollutantKey;
        if (!aggregatedMeasurements[p] && val !== undefined) {
          aggregatedMeasurements[p] = {
            pollutant: p,
            value: val,
            unit: p === "co" ? "mg/m³" : "µg/m³",
            timestamp: c.time,
            source: "openmeteo",
            measurementType: "modeled",
          };
        }
      }
    }

    const isDemo = Object.keys(aggregatedMeasurements).length === 0;
    if (isDemo) {
      return NextResponse.json({
        data: DEMO_AIR_QUALITY,
        isDemo: true,
        fetchedAt: new Date().toISOString(),
      });
    }

    const aqi = calculateAQI(aggregatedMeasurements);

    // Determine location name from geocoding
    let locationName = city || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    if (stationsData.length > 0 && stationsData[0].city) {
      locationName = `${stationsData[0].city}, ${stationsData[0].country || ""}`;
    }

    const result: AirQualityData = {
      location: {
        name: locationName,
        city: stationsData[0]?.city || city || undefined,
        country: stationsData[0]?.country,
        coordinates: { lat: latitude, lon: longitude },
      },
      measurements: aggregatedMeasurements,
      aqi,
      stations: stationsData,
      dataSource: [
        stationsData.length > 0 ? "OpenAQ v3 (ground monitoring)" : "",
        meteoData ? "Open-Meteo Air Quality API (model-based)" : "",
      ]
        .filter(Boolean)
        .join(" · "),
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    };

    return NextResponse.json({ data: result, isDemo: false, fetchedAt: result.fetchedAt });
  } catch (error: any) {
    console.error("Air quality API error:", error);
    // Fallback to demo data with clear label
    return NextResponse.json({
      data: DEMO_AIR_QUALITY,
      isDemo: true,
      error: error.message,
      fetchedAt: new Date().toISOString(),
    });
  }
}

