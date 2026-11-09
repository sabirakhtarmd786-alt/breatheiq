"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AQISpectrumBarProps {
  aqi: number;
  categoryLabel?: string;
  className?: string;
}

const SCALE_SEGMENTS = [
  { range: [0, 50], label: "Good", color: "#10B981", textColor: "text-emerald-400" },
  { range: [51, 100], label: "Moderate", color: "#F59E0B", textColor: "text-amber-400" },
  { range: [101, 150], label: "Sensitive", color: "#F97316", textColor: "text-orange-400" },
  { range: [151, 200], label: "Unhealthy", color: "#EF4444", textColor: "text-rose-400" },
  { range: [201, 300], label: "Very Unhealthy", color: "#A855F7", textColor: "text-purple-400" },
  { range: [301, 500], label: "Hazardous", color: "#881337", textColor: "text-red-300" },
];

export function AQISpectrumBar({ aqi, categoryLabel, className }: AQISpectrumBarProps) {
  const clampedAqi = Math.max(0, Math.min(500, aqi));
  // Calculate percentage along the 0-500 scale
  const percentage = Math.min(98, Math.max(2, (clampedAqi / 500) * 100));

  return (
    <div className={cn("space-y-2 select-none", className)}>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          AQI Scale Reference (US-EPA)
        </span>
        <span className="font-mono text-[11px]">
          Score: <strong className="text-slate-900 dark:text-white font-bold">{aqi}</strong> / 500
        </span>
      </div>

      {/* Relative Slider Container */}
      <div className="relative pt-6 pb-1">
        {/* Needle / Indicator Pin pointing down */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out z-20 pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md border border-slate-700 dark:border-slate-300">
            {aqi}
          </span>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-900 dark:border-t-white" />
        </div>

        {/* 6 Segmented Color Bars */}
        <div className="h-3 sm:h-3.5 w-full rounded-full overflow-hidden flex shadow-inner gap-0.5 p-0.5 bg-slate-200 dark:bg-navy-950 border border-slate-300 dark:border-navy-800">
          {SCALE_SEGMENTS.map((seg, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === SCALE_SEGMENTS.length - 1;
            const isActive = aqi >= seg.range[0] && aqi <= seg.range[1];
            return (
              <div
                key={seg.label}
                className={cn(
                  "flex-1 h-full transition-all relative group cursor-pointer",
                  isFirst && "rounded-l-full",
                  isLast && "rounded-r-full",
                  isActive ? "brightness-110 shadow-sm" : "opacity-85 hover:opacity-100"
                )}
                style={{ backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.range[0]}–${seg.range[1]}`}
              />
            );
          })}
        </div>
      </div>

      {/* Breakpoint Labels under segments */}
      <div className="grid grid-cols-6 text-[10px] sm:text-[11px] font-semibold text-center text-slate-500 dark:text-slate-400 gap-1">
        <div>
          <span className="block text-emerald-500 font-bold">Good</span>
          <span className="text-[9px] text-slate-400">0–50</span>
        </div>
        <div>
          <span className="block text-amber-500 font-bold">Moderate</span>
          <span className="text-[9px] text-slate-400">51–100</span>
        </div>
        <div>
          <span className="block text-orange-500 font-bold truncate">Sensitive</span>
          <span className="text-[9px] text-slate-400">101–150</span>
        </div>
        <div>
          <span className="block text-rose-500 font-bold">Unhealthy</span>
          <span className="text-[9px] text-slate-400">151–200</span>
        </div>
        <div>
          <span className="block text-purple-400 font-bold truncate">Very Poor</span>
          <span className="text-[9px] text-slate-400">201–300</span>
        </div>
        <div>
          <span className="block text-rose-800 dark:text-rose-400 font-bold">Hazardous</span>
          <span className="text-[9px] text-slate-400">301–500</span>
        </div>
      </div>
    </div>
  );
}

