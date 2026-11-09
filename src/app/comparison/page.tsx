"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState, ErrorState, InfoBadge, DemoBanner } from "@/components/shared/States";
import { AQIGauge } from "@/components/dashboard/AQIGauge";
import { PollutantCard } from "@/components/dashboard/PollutantCard";
import { POLLUTANTS, getAQICategory } from "@/lib/constants/aqi";
import type { PollutantKey } from "@/types";
import { Plus, X, Search, MapPin, Loader2 } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";

interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  data?: any;
  loading?: boolean;
  error?: string;
}

const POLLUTANT_KEYS: PollutantKey[] = ["pm2_5", "pm10", "no2", "so2", "co", "o3"];

export default function ComparisonPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  const searchLocations = async (q: string) => {
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {}
    setSearching(false);
  };

  const addLocation = (result: any) => {
    if (locations.length >= 4) return;
    const newLoc: LocationData = {
      id: result.place_id,
      name: result.display_name.split(",")[0],
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
    setLocations((prev) => [...prev, newLoc]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setComparisonResult(null);
  };

  const compare = useCallback(async () => {
    if (locations.length < 2) return;
    setComparing(true);
    try {
      const res = await fetch("/api/comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: locations.map((l) => ({ lat: l.lat, lon: l.lon, name: l.name })),
        }),
      });
      const json = await res.json();
      setComparisonResult(json);
    } catch (e: any) {
      console.error(e);
    }
    setComparing(false);
  }, [locations]);

  const radarData = comparisonResult?.data
    ? POLLUTANT_KEYS.map((p) => {
        const entry: Record<string, any> = { pollutant: POLLUTANTS[p].name };
        for (const loc of comparisonResult.data) {
          const m = loc.measurements[p];
          entry[loc.location.name] = m?.value ?? 0;
        }
        return entry;
      })
    : [];

  const RADAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Location Comparison</h1>
          <p className="text-sm text-slate-400 mt-1">Compare air quality across up to 4 locations</p>
        </div>

        {/* Search to add locations */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2">
                {searching ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Search className="w-4 h-4 text-slate-400" />}
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchLocations(e.target.value);
                  }}
                  placeholder="Search and add a location…"
                  className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none w-full"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10">
                  {searchResults.map((r) => (
                    <button key={r.place_id} onClick={() => addLocation(r)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-700 flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 truncate">{r.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={compare}
              disabled={locations.length < 2 || comparing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {comparing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Compare
            </button>
          </div>

          {/* Selected locations */}
          <div className="flex flex-wrap gap-2">
            {locations.map((loc, i) => (
              <span key={loc.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: `${RADAR_COLORS[i]}22`, color: RADAR_COLORS[i], border: `1px solid ${RADAR_COLORS[i]}44` }}>
                {loc.name}
                <button onClick={() => removeLocation(loc.id)} className="hover:opacity-70">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-slate-500">Search and add 2–4 locations to compare</p>
            )}
          </div>
        </Card>

        {comparing && <LoadingState message="Fetching data for all locations…" rows={2} />}

        {comparisonResult && !comparing && (
          <>
            <InfoBadge>{comparisonResult.note}</InfoBadge>

            {/* AQI comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonResult.data.map((loc: any, i: number) => {
                const catInfo = loc.aqi.calculated ? getAQICategory(loc.aqi.value) : null;
                return (
                  <Card key={i} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: RADAR_COLORS[i] }} />
                    <p className="text-sm font-medium text-slate-200 mb-3 truncate">{loc.location.name}</p>
                    <AQIGauge aqi={loc.aqi} size="sm" />
                    {catInfo && <p className="text-xs text-slate-400 mt-2">{catInfo.label}</p>}
                  </Card>
                );
              })}
            </div>

            {/* Radar chart */}
            {radarData.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Pollutant Comparison (Radar)</CardTitle></CardHeader>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="pollutant" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                      {comparisonResult.data.map((loc: any, i: number) => (
                        <Radar key={i} name={loc.location.name} dataKey={loc.location.name}
                          stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.1} />
                      ))}
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Pollutant table */}
            <Card noPad>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-6 py-3 text-slate-400 font-medium">Pollutant</th>
                      {comparisonResult.data.map((loc: any, i: number) => (
                        <th key={i} className="text-center px-4 py-3 font-medium" style={{ color: RADAR_COLORS[i] }}>
                          {loc.location.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {POLLUTANT_KEYS.map((p) => {
                      const info = POLLUTANTS[p];
                      const values = comparisonResult.data.map((loc: any) => loc.measurements[p]?.value);
                      const minVal = Math.min(...values.filter((v: any) => v !== undefined));
                      return (
                        <tr key={p} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-3 text-slate-300 font-medium">{info.name} <span className="text-xs text-slate-500">({info.unit})</span></td>
                          {comparisonResult.data.map((loc: any, i: number) => {
                            const val = loc.measurements[p]?.value;
                            const isBest = val !== undefined && val === minVal;
                            return (
                              <td key={i} className="px-4 py-3 text-center">
                                {val !== undefined ? (
                                  <span className={`font-mono ${isBest ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
                                    {val.toFixed(1)}
                                    {isBest && " ✓"}
                                  </span>
                                ) : <span className="text-slate-600">—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="px-6 py-3 text-xs text-slate-500">✓ indicates lower value among compared locations</p>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

