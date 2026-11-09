"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState, ErrorState, InfoBadge } from "@/components/shared/States";
import { POLLUTANTS } from "@/lib/constants/aqi";
import { formatDateShort, formatHour } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from "recharts";
import type { PollutantKey } from "@/types";

const POLLUTANT_COLORS: Record<PollutantKey, string> = {
  pm25: "#f97316", pm10: "#fb923c", no2: "#a78bfa",
  so2: "#facc15", co: "#94a3b8", o3: "#22d3ee",
};

const AVAILABLE_POLLUTANTS: PollutantKey[] = ["pm25", "pm10", "no2", "o3"];

export default function AnalyticsPage() {
  const [data, setData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PollutantKey>("pm25");
  const [view, setView] = useState<"hourly" | "daily">("hourly");
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [source, setSource] = useState("");

  const fetchHistory = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || {});
      setSource(json.source || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(coords.lat, coords.lon); }, [coords, fetchHistory]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setCoords(e.detail.coordinates);
    };
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  const rawSeries = data[selected] || [];

  // Daily aggregation
  const dailyData = rawSeries.reduce<Record<string, number[]>>((acc, item) => {
    const day = item.time.substring(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(item.value);
    return acc;
  }, {});

  const dailySeries = Object.entries(dailyData).map(([date, values]) => ({
    time: date,
    value: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
    label: formatDateShort(date),
  }));

  const displayData =
    view === "daily"
      ? dailySeries
      : rawSeries.slice(0, 48).map((d) => ({ ...d, label: formatHour(d.time) }));

  const info = POLLUTANTS[selected];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Historical Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Model-based air quality estimates over time
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {AVAILABLE_POLLUTANTS.map((p) => (
              <button
                key={p}
                onClick={() => setSelected(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selected === p
                    ? "text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                }`}
                style={selected === p ? { backgroundColor: POLLUTANT_COLORS[p] } : {}}
              >
                {POLLUTANTS[p].name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {(["hourly", "daily"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  view === v
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading historical data…" rows={3} />
        ) : error ? (
          <ErrorState title="Could not load historical data" message={error} onRetry={() => fetchHistory(coords.lat, coords.lon)} />
        ) : (
          <>
            <InfoBadge>
              {source} · These are model-based estimates for context. Direct station-measured historical data requires OpenAQ API access.
            </InfoBadge>

            {/* Line chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {info.name} — {info.fullName}
                </CardTitle>
                <span className="text-xs text-slate-500">{info.unit}</span>
              </CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8" }}
                      itemStyle={{ color: POLLUTANT_COLORS[selected] }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={POLLUTANT_COLORS[selected]}
                      strokeWidth={2}
                      dot={false}
                      name={`${info.name} (${info.unit})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar chart for daily averages */}
            {view === "daily" && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Average — {info.name}</CardTitle>
                </CardHeader>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                        labelStyle={{ color: "#94a3b8" }}
                      />
                      <Bar dataKey="value" fill={POLLUTANT_COLORS[selected]} radius={[4, 4, 0, 0]} name={`${info.name} (${info.unit})`} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Stats summary */}
            {rawSeries.length > 0 && (() => {
              const values = rawSeries.map((d) => d.value);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              const max = Math.max(...values);
              const min = Math.min(...values);
              return (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Average", value: avg.toFixed(1) },
                    { label: "Maximum", value: max.toFixed(1) },
                    { label: "Minimum", value: min.toFixed(1) },
                  ].map((s) => (
                    <Card key={s.label} className="p-4 text-center">
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-100 mt-1">{s.value}</p>
                      <p className="text-xs text-slate-500">{info.unit}</p>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </AppShell>
  );
}

