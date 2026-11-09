"use client";

import { AppShell } from "@/components/navigation/AppShell";
import { MapWrapper } from "@/components/maps/MapWrapper";
import { Layers } from "lucide-react";

export default function MapPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-4 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-400" />
              Live Air Quality Map of India
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Interactive CPCB / CAAQMS monitoring network across all Indian states and cities. Click state or city pins to explore ground stations.
            </p>
          </div>
        </div>
        <MapWrapper />
      </div>
    </AppShell>
  );
}

