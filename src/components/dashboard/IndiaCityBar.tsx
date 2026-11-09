"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IndiaCity {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export const INDIA_CITIES: IndiaCity[] = [
  { name: "New Delhi", state: "NCR", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", state: "MH", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", state: "KA", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", state: "WB", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", state: "TN", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", state: "TS", lat: 17.385, lon: 78.4867 },
  { name: "Ahmedabad", state: "GJ", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", state: "MH", lat: 18.5204, lon: 73.8567 },
  { name: "Lucknow", state: "UP", lat: 26.8467, lon: 80.9462 },
  { name: "Jaipur", state: "RJ", lat: 26.9124, lon: 75.7873 },
  { name: "Patna", state: "BR", lat: 25.5941, lon: 85.1376 },
  { name: "Chandigarh", state: "PB/HR", lat: 30.7333, lon: 76.7794 },
];

interface IndiaCityBarProps {
  currentCityName?: string;
  onSelectCity: (city: IndiaCity) => void;
}

export function IndiaCityBar({ currentCityName, onSelectCity }: IndiaCityBarProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>India Hubs:</span>
        </div>
        {INDIA_CITIES.map((city) => {
          const isActive =
            currentCityName?.toLowerCase().includes(city.name.toLowerCase());
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={cn(
                "group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-200",
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-500"
              )}
            >
              <span>{city.name}</span>
              <span
                className={cn(
                  "text-[10px] px-1 py-0.2 rounded font-mono",
                  isActive
                    ? "bg-emerald-600/60 text-emerald-100"
                    : "bg-slate-700/60 text-slate-400 group-hover:text-slate-300"
                )}
              >
                {city.state}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

