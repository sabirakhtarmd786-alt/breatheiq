"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { AQIGauge } from "@/components/dashboard/AQIGauge";
import { PollutantCard } from "@/components/dashboard/PollutantCard";
import { DemoBanner, LoadingState, ErrorState } from "@/components/shared/States";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTimestamp, formatDate } from "@/lib/utils";
import { POLLUTANTS, getAQICategory, AQI_CATEGORIES } from "@/lib/constants/aqi";
import type { AirQualityData, PollutantKey } from "@/types";
import {
  MapPin, RefreshCw, Info, Activity, Clock, Database,
  Wind, Thermometer, Eye, ChevronRight
} from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const POLLUTANT_KEYS: PollutantKey[] = ["pm25", "pm10", "no2", "so2", "co", "o3"];

export default function OverviewPage() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });
  const [locationName, setLocationName] = useState("New Delhi, India");

  const fetchData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      setData(json.data);
      setIsDemo(json.isDemo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(coords.lat, coords.lon);
  }, [coords, fetchData]);

  // Listen for location changes from Header search
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { name, coordinates } = e.detail;
      setLocationName(name);
      setCoords(coordinates);
    };
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  const catInfo = data?.aqi ? getAQICategory(data.aqi.value) : null;

  // Mini AQI scale data for chart
  const aqiScaleData = AQI_CATEGORIES.map((c) => ({
    name: c.label.split(" ")[0],
    min: c.range[0],
    max: c.range[1],
    fill: c.color,
  }));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Air Quality Overview</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{data?.location.name || locationName}</span>
              {data?.fetchedAt && (
                <>
                  <span className="text-slate-600">·</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatTimestamp(data.fetchedAt)}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => fetchData(coords.lat, coords.lon)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Demo banner */}
        {isDemo && <DemoBanner />}

        {loading ? (
          <LoadingState message="Fetching air quality data…" rows={4} />
        ) : error ? (
          <ErrorState
            title="Could not load air quality data"
            message={error}
            onRetry={() => fetchData(coords.lat, coords.lon)}
          />
        ) : data ? (
          <>
            {/* Top row: AQI card + quick stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main AQI Card */}
              <Card className="lg:col-span-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Air Quality Index
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">US-EPA Standard</p>
                </div>
                <AQIGauge aqi={data.aqi} size="lg" />
                {catInfo && (
                  <div className="text-center px-4 py-3 bg-slate-700/50 rounded-xl w-full">
                    <p className="text-xs text-slate-300">{catInfo.advice}</p>
                  </div>
                )}
                {data.aqi.dominantPollutant && (
                  <p className="text-xs text-slate-500">
                    Dominant pollutant:{" "}
                    <span className="text-slate-300 font-medium">
                      {POLLUTANTS[data.aqi.dominantPollutant].name}
                    </span>
                  </p>
                )}
              </Card>

              {/* Right side: Stats + data source */}
              <div className="lg:col-span-2 space-y-4">
                {/* AQI category scale */}
                <Card>
                  <CardHeader>
                    <CardTitle>AQI Scale Reference</CardTitle>
                    <span className="text-xs text-slate-500">US-EPA Standard</span>
                  </CardHeader>
                  <div className="space-y-2">
                    {AQI_CATEGORIES.map((cat) => {
                      const isActive =
                        data.aqi.calculated &&
                        data.aqi.value >= cat.range[0] &&
                        data.aqi.value <= cat.range[1];
                      return (
                        <div
                          key={cat.label}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive ? "bg-slate-700/80 ring-1" : "opacity-50"
                          }`}
                          style={{ ringColor: isActive ? cat.color : undefined } as any}
                        >
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs text-slate-300 font-medium flex-1">
                            {cat.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {cat.range[0]}–{cat.range[1]}
                          </span>
                          {isActive && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${cat.color}22`,
                                color: cat.color,
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Data source info */}
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-300 mb-1">Data Sources</p>
                      <p className="text-xs text-slate-500">{data.dataSource}</p>
                      {data.stations.length > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          {data.stations.length} monitoring station(s) found nearby
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Pollutant cards grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-200">Pollutant Readings</h2>
                <span className="text-xs text-slate-500">
                  {Object.keys(data.measurements).length}/{POLLUTANT_KEYS.length} pollutants measured
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {POLLUTANT_KEYS.map((key) => (
                  <PollutantCard
                    key={key}
                    pollutant={key}
                    measurement={data.measurements[key]}
                  />
                ))}
              </div>
            </div>

            {/* Quick links to other features */}
            <div>
              <h2 className="font-semibold text-slate-200 mb-4">Explore More</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { href: "/map", label: "Interactive Map", desc: "Explore stations nearby", icon: "🗺️" },
                  { href: "/analytics", label: "Analytics", desc: "Historical trends", icon: "📊" },
                  { href: "/health", label: "Health Guide", desc: "Safety recommendations", icon: "💚" },
                  { href: "/forecast", label: "Forecast", desc: "5-day air quality", icon: "🌤️" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-slate-700/50 transition-all group"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Data disclaimer */}
            <Card className="p-4 border-slate-700/30">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">
                  AQI is calculated using the{" "}
                  <strong className="text-slate-400">US-EPA standard</strong> from available
                  pollutant measurements. Missing pollutant data may affect the displayed AQI
                  value. Ground monitoring station data is from OpenAQ v3. Model-based
                  estimates are from Open-Meteo and are clearly labeled. This data is for
                  general informational purposes only.
                </p>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
