"use client";

import React, { useState } from "react";
import { MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAQIColorHex } from "@/lib/aqi/calculator";
import { AQICategory } from "@/types";

export interface CityHubItem {
  name: string;
  state: string;
  country?: string;
  lat: number;
  lon: number;
  aqi: number;
  category: AQICategory;
  isGlobal?: boolean;
}

export const INDIA_CITIES: CityHubItem[] = [
  { name: "New Delhi", state: "NCR", country: "India", lat: 28.6139, lon: 77.209, aqi: 382, category: "hazardous" },
  { name: "Mumbai", state: "MH", country: "India", lat: 19.076, lon: 72.8777, aqi: 148, category: "sensitive" },
  { name: "Bengaluru", state: "KA", country: "India", lat: 12.9716, lon: 77.5946, aqi: 62, category: "moderate" },
  { name: "Kolkata", state: "WB", country: "India", lat: 22.5726, lon: 88.3639, aqi: 185, category: "unhealthy" },
  { name: "Chennai", state: "TN", country: "India", lat: 13.0827, lon: 80.2707, aqi: 78, category: "moderate" },
  { name: "Hyderabad", state: "TS", country: "India", lat: 17.385, lon: 78.4867, aqi: 92, category: "moderate" },
  { name: "Ahmedabad", state: "GJ", country: "India", lat: 23.0225, lon: 72.5714, aqi: 165, category: "unhealthy" },
  { name: "Pune", state: "MH", country: "India", lat: 18.5204, lon: 73.8567, aqi: 88, category: "moderate" },
  { name: "Lucknow", state: "UP", country: "India", lat: 26.8467, lon: 80.9462, aqi: 245, category: "veryUnhealthy" },
  { name: "Jaipur", state: "RJ", country: "India", lat: 26.9124, lon: 75.7873, aqi: 195, category: "unhealthy" },
  { name: "Patna", state: "BR", country: "India", lat: 25.5941, lon: 85.1376, aqi: 285, category: "veryUnhealthy" },
  { name: "Chandigarh", state: "PB/HR", country: "India", lat: 30.7333, lon: 76.7794, aqi: 135, category: "sensitive" },
];

export const GLOBAL_CITIES: CityHubItem[] = [
  { name: "Dubai", state: "UAE", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, aqi: 128, category: "sensitive", isGlobal: true },
  { name: "Tokyo", state: "Japan", country: "Japan", lat: 35.6762, lon: 139.6503, aqi: 35, category: "good", isGlobal: true },
  { name: "London", state: "UK", country: "United Kingdom", lat: 51.5074, lon: -0.1278, aqi: 32, category: "good", isGlobal: true },
  { name: "New York", state: "USA", country: "United States", lat: 40.7128, lon: -74.006, aqi: 45, category: "good", isGlobal: true },
  { name: "Singapore", state: "SG", country: "Singapore", lat: 1.3521, lon: 103.8198, aqi: 48, category: "good", isGlobal: true },
];

interface IndiaCityBarProps {
  currentCityName?: string;
  onSelectCity: (city: { name: string; lat: number; lon: number; country?: string }) => void;
}

export function IndiaCityBar({ currentCityName, onSelectCity }: IndiaCityBarProps) {
  const [activeScope, setActiveScope] = useState<"india" | "global">("india");

  const displayCities = activeScope === "india" ? INDIA_CITIES : GLOBAL_CITIES;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 select-none">
      {/* Scope Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shrink-0">
        <button
          type="button"
          onClick={() => setActiveScope("india")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            activeScope === "india"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>India Metros</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScope("global")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            activeScope === "global"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>World Cities</span>
        </button>
      </div>

      {/* Horizontal Scrollable Cities */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none scroll-smooth flex-1 min-w-0">
        {displayCities.map((city) => {
          const isActive = currentCityName?.toLowerCase().includes(city.name.toLowerCase());
          const badgeColor = getAQIColorHex(city.category);

          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold shrink-0 transition-all duration-200 border backdrop-blur-md shadow-sm",
                isActive
                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md ring-1 ring-emerald-500/30"
                  : "bg-white/90 dark:bg-navy-900/90 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-850"
              )}
            >
              <span>{city.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                {city.state}
              </span>
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs"
                style={{ backgroundColor: badgeColor }}
              >
                {city.aqi}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

