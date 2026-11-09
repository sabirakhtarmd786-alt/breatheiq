"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, Wind, Sparkles } from "lucide-react";
import type { AirQualityData } from "@/types";
import { POLLUTANTS } from "@/lib/constants/aqi";

interface ShareCardModalProps {
  data: AirQualityData | any;
  onClose: () => void;
}

export function ShareCardModal({ data, onClose }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  const dominantName = data?.aqi?.dominantPollutant
    ? ((POLLUTANTS as Record<string, any>)[data.aqi.dominantPollutant]?.name || data.aqi.dominantPollutant)
    : "Multiple";

  const summaryText = `🌿 BreatheIQ Air Quality Report
📍 Location: ${data?.location?.name || "Current Location"}
📊 AQI: ${data?.aqi?.value ?? "—"} (${data?.aqi?.category || "Unknown"}) - US-EPA Standard
⚠️ Dominant Pollutant: ${dominantName}
💨 Wind: ${data?.weather?.windSpeed || "—"} km/h | 🌡️ Temp: ${data?.weather?.temperature || "—"}°C
🗓️ Verified at: ${new Date(data?.fetchedAt || data?.timestamp || Date.now()).toLocaleTimeString()}
Understand your air. Protect your health: http://localhost:3000`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Share Air Quality Snapshot</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Shareable Card Preview */}
        <div
          className="rounded-2xl p-6 text-slate-100 relative overflow-hidden border shadow-xl"
          style={{
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            borderColor: `${data.aqi.color}44`,
          }}
        >
          {/* Decorative ambient corner glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ backgroundColor: data.aqi.color }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                <Wind className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">BreatheIQ</span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${data.aqi.color}22`,
                borderColor: `${data.aqi.color}66`,
                color: data.aqi.color,
              }}
            >
              {data.aqi.category}
            </span>
          </div>

          <p className="text-xs text-slate-400">{data.location.name}</p>

          <div className="my-4 flex items-baseline gap-2">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: data.aqi.color }}
            >
              {data.aqi.value}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              US-EPA AQI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-700/60 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">Dominant:</span>
              <span className="font-semibold">{dominantName}</span>
            </div>
            {data.weather?.temperature !== undefined && (
              <div>
                <span className="text-slate-500 block text-[10px]">Atmosphere:</span>
                <span className="font-semibold">
                  {data.weather.temperature}°C · {data.weather.windSpeed || 0} km/h
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Shareable Summary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
