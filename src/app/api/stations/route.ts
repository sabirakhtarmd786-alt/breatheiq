// API Route: GET /api/stations?lat=&lon=&radius=
import { NextResponse } from "next/server";
import { getNearbyLocations } from "@/lib/api/openaq";
import { DEMO_STATIONS } from "@/lib/data/demo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radius = searchParams.get("radius") || "25000";

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  try {
    const stations = await getNearbyLocations(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(radius),
      20
    );

    if (stations.length === 0) {
      return NextResponse.json({
        data: DEMO_STATIONS,
        isDemo: true,
        message: "No real stations found in this area. Showing demo stations.",
        fetchedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      data: stations,
      isDemo: false,
      count: stations.length,
      source: "OpenAQ v3",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      data: DEMO_STATIONS,
      isDemo: true,
      error: error.message,
      fetchedAt: new Date().toISOString(),
    });
  }
}

