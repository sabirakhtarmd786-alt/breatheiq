// API Route: GET /api/forecast?lat=&lon=
import { NextResponse } from "next/server";
import { getOpenMeteoAirQuality } from "@/lib/api/openmeteo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  try {
    const { forecast } = await getOpenMeteoAirQuality(parseFloat(lat), parseFloat(lon));
    return NextResponse.json({
      data: forecast,
      source: "Open-Meteo Air Quality API (model-based forecast)",
      note: "These are model-based forecasts, not monitoring station measurements.",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

