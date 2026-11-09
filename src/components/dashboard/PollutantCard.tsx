"use client";

import { cn } from "@/lib/utils";
import { POLLUTANTS } from "@/lib/constants/aqi";
import type { Measurement, PollutantKey } from "@/types";
import { formatTimestamp } from "@/lib/utils";

const POLLUTANT_COLORS: Record<PollutantKey, string> = {
  pm25: "#f97316",
  pm10: "#fb923c",
  no2: "#a78bfa",
  so2: "#facc15",
  co: "#94a3b8",
  o3: "#22d3ee",
};

const SAFE_LEVELS: Record<PollutantKey, number> = {
  pm25: 15,
  pm10: 50,
  no2: 40,
  so2: 20,
  co: 4,
  o3: 100,
};

interface PollutantCardProps {
  pollutant: PollutantKey;
  measurement?: Measurement;
}

export function PollutantCard({ pollutant, measurement }: PollutantCardProps) {
  const info = POLLUTANTS[pollutant];
  const color = POLLUTANT_COLORS[pollutant];
  const safeLevel = SAFE_LEVELS[pollutant];
  const hasData = measurement !== undefined;
  const value = measurement?.value;
  const pct = hasData && value !== undefined ? Math.min((value / (safeLevel * 4)) * 100, 100) : 0;

  const severity =
    !hasData || value === undefined
      ? "no-data"
      : value <= safeLevel
      ? "good"
      : value <= safeLevel * 2
      ? "moderate"
      : value <= safeLevel * 3
      ? "high"
      : "very-high";

  const severityLabel: Record<string, string> = {
    "no-data": "No data",
    good: "Good",
    moderate: "Moderate",
    high: "High",
    "very-high": "Very High",
  };

  const severityColor: Record<string, string> = {
    "no-data": "#64748b",
    good: "#22c55e",
    moderate: "#eab308",
    high: "#f97316",
    "very-high": "#ef4444",
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {info.name}
          </span>
          <p className="text-xs text-slate-500 mt-1">{info.fullName}</p>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${severityColor[severity]}22`,
            color: severityColor[severity],
          }}
        >
          {severityLabel[severity]}
        </span>
      </div>

      {/* Value */}
      <div className="mb-3">
        {hasData && value !== undefined ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-100">
              {value < 10 ? value.toFixed(2) : value.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">{info.unit}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">No data available</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Safe: &lt;{safeLevel} {info.unit}
        </span>
        {measurement?.timestamp && (
          <span className="text-xs text-slate-600">
            {formatTimestamp(measurement.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

