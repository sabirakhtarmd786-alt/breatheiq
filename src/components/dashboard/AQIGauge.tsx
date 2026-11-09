"use client";

import { cn } from "@/lib/utils";
import type { AQIResult } from "@/types";
import { getAQICategory } from "@/lib/constants/aqi";
import { AlertTriangle } from "lucide-react";

interface AQIGaugeProps {
  aqi: AQIResult;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function AQIGauge({ aqi, size = "md", showLabel = true }: AQIGaugeProps) {
  const isUnknown = !aqi.calculated;
  const pct = isUnknown ? 0 : Math.min((aqi.value / 500) * 100, 100);
  
  const sizeMap = {
    sm: { w: 100, h: 100, strokeW: 8, fontSize: "text-2xl" },
    md: { w: 160, h: 160, strokeW: 12, fontSize: "text-4xl" },
    lg: { w: 220, h: 220, strokeW: 16, fontSize: "text-6xl" },
  };
  const { w, h, strokeW, fontSize } = sizeMap[size];
  
  const radius = (w - strokeW * 2) / 2;
  const circumference = radius * Math.PI * 1.5; // 270° arc
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: w, height: h * 0.75 }}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ marginTop: -(h * 0.25) }}
        >
          {/* Background arc */}
          <circle
            cx={w / 2}
            cy={h / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeW}
            strokeDasharray={`${circumference} ${circumference * (4 / 3)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135, ${w / 2}, ${h / 2})`}
          />
          {/* Foreground arc */}
          {!isUnknown && (
            <circle
              cx={w / 2}
              cy={h / 2}
              r={radius}
              fill="none"
              stroke={aqi.color}
              strokeWidth={strokeW}
              strokeDasharray={`${circumference} ${circumference * (4 / 3)}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(135, ${w / 2}, ${h / 2})`}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          )}
          {/* Center value */}
          <text
            x={w / 2}
            y={h / 2 + (size === "sm" ? 10 : size === "md" ? 14 : 20)}
            textAnchor="middle"
            fill={isUnknown ? "#64748b" : aqi.color}
            fontSize={size === "sm" ? 24 : size === "md" ? 36 : 52}
            fontWeight="bold"
            fontFamily="system-ui"
          >
            {isUnknown ? "—" : aqi.value}
          </text>
          <text
            x={w / 2}
            y={h / 2 + (size === "sm" ? 24 : size === "md" ? 32 : 44)}
            textAnchor="middle"
            fill="#64748b"
            fontSize={size === "sm" ? 10 : 12}
            fontFamily="system-ui"
          >
            US-EPA AQI
          </text>
        </svg>
      </div>

      {showLabel && (
        <div className="text-center">
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{
              backgroundColor: isUnknown ? "#1e293b" : `${aqi.color}22`,
              color: isUnknown ? "#64748b" : aqi.color,
              border: `1px solid ${isUnknown ? "#334155" : `${aqi.color}44`}`,
            }}
          >
            {isUnknown ? "No AQI data" : aqi.category}
          </span>
          {aqi.message && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3 h-3" />
              {aqi.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

