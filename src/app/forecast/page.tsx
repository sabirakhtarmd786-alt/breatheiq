"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState, ErrorState, InfoBadge } from "@/components/shared/States";
import { POLLUTANTS } from "@/lib/constants/aqi";
import { formatDateShort } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { ForecastDay, PollutantKey } from "@/types";
import { CloudSun, Sun, Cloud, CloudRain, Info } from "lucide-react";
import { getAQICategory } from "@/lib/constants/aqi";

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [selected, setSelected] = useState<PollutantKey>("pm25");
  const [source, setSource] = useState("");

  const fetchForecast = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setForecast(json.data || []);
      setSource(json.source || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(coords.lat, coords.lon); }, [coords]);

  useEffect(() => {
    const handler = (e: CustomEvent) => setCoords(e.detail.coordinates);
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  // Flatten hourly data for chart
  const chartData = forecast.flatMap((day) =>
    day.hours.map((h) => ({
      time: h.time,
      label: `${formatDateShort(h.time)} ${h.time.substring(11, 13)}:00`,
      pm25: h.pm25,
      pm10: h.pm10,
      no2: h.no2,
      o3: h.o3,
    }))
  ).slice(0, 72); // next 3 days hourly

  const POLLUTANT_COLORS: Record<PollutantKey, string> = {
    pm25: "#f97316", pm10: "#fb923c", no2: "#a78bfa", so2: "#facc15", co: "#94a3b8", o3: "#22d3ee",
  };

  const AVAILABLE: PollutantKey[] = ["pm25", "pm10", "no2", "o3"];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Air Quality Forecast</h1>
          <p className="text-sm text-slate-400 mt-1">5-day model-based air quality forecast</p>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            <strong>Forecast disclaimer:</strong> This data is a model-based forecast from Open-Meteo, not measured monitoring station data. It represents predicted air quality, not verified readings.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading forecast…" rows={3} />
        ) : error ? (
          <ErrorState title="Could not load forecast" message={error} onRetry={() => fetchForecast(coords.lat, coords.lon)} />
        ) : (
          <>
            {/* Daily cards */}
            <div>
              <h2 className="font-semibold text-slate-200 mb-3">Daily Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {forecast.slice(0, 5).map((day) => {
                  const pm25 = day.avgPm25 ?? 0;
                  const color = pm25 < 15 ? "#22c55e" : pm25 < 35 ? "#eab308" : pm25 < 55 ? "#f97316" : "#ef4444";
                  return (
                    <Card key={day.date} className="text-center p-4">
                      <p className="text-xs text-slate-400 mb-2">{formatDateShort(day.date)}</p>
                      <div className="text-3xl mb-2">
                        {pm25 < 15 ? "🌤️" : pm25 < 35 ? "🌥️" : pm25 < 55 ? "🌫️" : "😷"}
                      </div>
                      {day.avgPm25 !== undefined && (
                        <div>
                          <span className="text-lg font-bold" style={{ color }}>{day.avgPm25.toFixed(1)}</span>
                          <span className="text-xs text-slate-500 block">PM2.5 µg/m³ avg</span>
                        </div>
                      )}
                      {day.avgPm10 !== undefined && (
                        <p className="text-xs text-slate-500 mt-1">PM10: {day.avgPm10} µg/m³</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Pollutant selector */}
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE.map((p) => (
                <button key={p} onClick={() => setSelected(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selected === p ? "text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                  style={selected === p ? { backgroundColor: POLLUTANT_COLORS[p] } : {}}>
                  {POLLUTANTS[p].name}
                </button>
              ))}
            </div>

            {/* Area chart */}
            <Card>
              <CardHeader>
                <CardTitle>72-Hour {POLLUTANTS[selected].name} Forecast</CardTitle>
                <span className="text-xs text-slate-500">Model-based · {POLLUTANTS[selected].unit}</span>
              </CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} interval={11} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey={selected} stroke={POLLUTANT_COLORS[selected]}
                      fill={`${POLLUTANT_COLORS[selected]}22`} strokeWidth={2} name={`${POLLUTANTS[selected].name} (${POLLUTANTS[selected].unit})`}
                      connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <p className="text-xs text-slate-500 text-center">{source}</p>
          </>
        )}
      </div>
    </AppShell>
  );
}

