// API Route: GET /api/history?lat=&lon=&days=7
// Returns historical measurements from OpenAQ
import { NextResponse } from "next/server";
import { getNearbyLocations } from "@/lib/api/openaq";
import { getOpenMeteoAirQuality } from "@/lib/api/openmeteo";
import type { PollutantKey } from "@/types";
import { subDays, formatISO } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const days = parseInt(searchParams.get("days") || "7");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  try {
    // OpenAQ v3 provides current readings per station
    // For historical, we use Open-Meteo which provides hourly model data
    const { forecast } = await getOpenMeteoAirQuality(parseFloat(lat), parseFloat(lon));

    // Transform hourly forecast into historical-style time series
    const series: Record<string, { time: string; value: number }[]> = {
      pm25: [],
      pm10: [],
      no2: [],
      o3: [],
    };

    for (const day of forecast) {
      for (const hour of day.hours) {
        if (hour.pm25 !== undefined) series.pm25.push({ time: hour.time, value: hour.pm25 });
        if (hour.pm10 !== undefined) series.pm10.push({ time: hour.time, value: hour.pm10 });
        if (hour.no2 !== undefined) series.no2.push({ time: hour.time, value: hour.no2 });
        if (hour.o3 !== undefined) series.o3.push({ time: hour.time, value: hour.o3 });
      }
    }

    return NextResponse.json({
      data: series,
      source: "Open-Meteo Air Quality API (model-based estimates)",
      note: "Historical data shown is model-based, not direct monitoring station measurements. OpenAQ historical data requires a registered API key with enhanced permissions.",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

