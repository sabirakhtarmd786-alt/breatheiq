"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/navigation/AppShell";
import { LoadingState } from "@/components/shared/States";

// Leaflet cannot render server-side — load dynamically
const AirQualityMap = dynamic(
  () => import("@/components/maps/AirQualityMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[70vh] bg-slate-800 rounded-2xl flex items-center justify-center">
        <LoadingState message="Loading interactive map…" rows={1} />
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-4 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Explore Air Quality Map</h1>
          <p className="text-sm text-slate-400 mt-1">
            Click station markers to view pollutant readings. Data from OpenAQ v3.
          </p>
        </div>
        <AirQualityMap />
      </div>
    </AppShell>
  );
}

