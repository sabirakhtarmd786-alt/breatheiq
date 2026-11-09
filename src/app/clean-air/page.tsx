"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState, DemoBanner } from "@/components/shared/States";
import type { Station } from "@/types";
import { POLLUTANTS } from "@/lib/constants/aqi";
import { formatTimestamp } from "@/lib/utils";
import { Leaf, MapPin, Clock, ExternalLink } from "lucide-react";

export default function CleanAirPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchStations = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stations?lat=${lat}&lon=${lon}&radius=50000`);
      const json = await res.json();
      setStations(json.data || []);
      setIsDemo(json.isDemo || false);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchStations(coords.lat, coords.lon); }, [coords, fetchStations]);

  useEffect(() => {
    const handler = (e: CustomEvent) => setCoords(e.detail.coordinates);
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUserCoords(c);
      setCoords(c);
    });
  };

  // Sort stations by PM2.5 (lowest first = cleanest)
  const ranked = [...stations]
    .filter((s) => s.measurements.pm25 !== undefined)
    .sort((a, b) => (a.measurements.pm25?.value ?? 999) - (b.measurements.pm25?.value ?? 999));

  const noDataStations = stations.filter((s) => s.measurements.pm25 === undefined);

  function getCleanBadge(pm25: number): { label: string; color: string } {
    if (pm25 < 15) return { label: "Good Air", color: "#22c55e" };
    if (pm25 < 35) return { label: "Moderate", color: "#eab308" };
    if (pm25 < 55) return { label: "High", color: "#f97316" };
    return { label: "Very High", color: "#ef4444" };
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            Clean Air Finder
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Nearby monitoring stations ranked by available PM2.5 readings — lower is better
          </p>
        </div>

        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300">
          <strong>Note:</strong> Rankings are based on the latest available PM2.5 measurement from each station. Stations may have different measurement times and sensor types. A lower reading does not guarantee the location is safe — it means lower measured PM2.5 at the time of the last reading.
        </div>

        {/* Location buttons */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={requestLocation}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition-colors">
            <MapPin className="w-4 h-4" />
            Use My Location
          </button>
          {userCoords && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Using device location
            </span>
          )}
        </div>

        {isDemo && <DemoBanner />}

        {loading ? <LoadingState rows={4} /> : (
          <>
            {ranked.length > 0 ? (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-200">
                  {ranked.length} station(s) ranked by PM2.5
                </h2>
                {ranked.map((station, i) => {
                  const pm25 = station.measurements.pm25!;
                  const badge = getCleanBadge(pm25.value);
                  return (
                    <Card key={station.id} className={`p-4 ${i === 0 ? "ring-1 ring-emerald-500/40" : ""}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ backgroundColor: `${badge.color}22`, color: badge.color }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="font-medium text-slate-200 truncate">{station.name}</p>
                              {station.city && <p className="text-xs text-slate-500 mt-0.5">{station.city}{station.country ? `, ${station.country}` : ""}</p>}
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: `${badge.color}22`, color: badge.color }}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <div>
                              <p className="text-xs text-slate-500">PM2.5</p>
                              <p className="text-lg font-bold" style={{ color: badge.color }}>
                                {pm25.value.toFixed(1)} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                              </p>
                            </div>
                            {Object.entries(station.measurements).filter(([k]) => k !== "pm25").map(([key, m]) => {
                              if (!m) return null;
                              const info = POLLUTANTS[m.pollutant];
                              return (
                                <div key={key}>
                                  <p className="text-xs text-slate-500">{info.name}</p>
                                  <p className="text-sm font-medium text-slate-300">{m.value.toFixed(1)} <span className="text-xs text-slate-500">{info.unit}</span></p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pm25.timestamp ? formatTimestamp(pm25.timestamp) : "Unknown time"}
                            </span>
                            <span>Source: {pm25.source === "demo" ? "Demo Data" : "OpenAQ v3"}</span>
                            {i === 0 && <span className="text-emerald-400 font-medium">★ Cleanest in area</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-16">
                <Leaf className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No stations with PM2.5 data found in this area</p>
                <p className="text-xs text-slate-500 mt-1">Try a different location or search a major city</p>
              </Card>
            )}

            {noDataStations.length > 0 && (
              <Card className="p-4">
                <p className="text-xs text-slate-500">
                  {noDataStations.length} additional station(s) found without PM2.5 data are not ranked.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

