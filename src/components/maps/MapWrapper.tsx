'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2, MapPin } from 'lucide-react';

// Dynamic import with SSR disabled to protect Leaflet window references
const DynamicIndiaMap = dynamic(
  () => import('./IndiaAirQualityMap').then((mod) => mod.IndiaAirQualityMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] sm:h-[720px] rounded-3xl border border-slate-200 dark:border-navy-800 bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center animate-pulse">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading Interactive Air Quality Map...</span>
        </div>
      </div>
    ),
  }
);

export function MapWrapper() {
  return <DynamicIndiaMap />;
}
