"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingState } from "@/components/shared/States";
import { getAQICategory, POLLUTANTS, AQI_CATEGORIES } from "@/lib/constants/aqi";
import type { AirQualityData, PollutantKey } from "@/types";
import { Heart, AlertTriangle, CheckCircle, Info, Shield, Wind, Activity } from "lucide-react";

const HEALTH_GUIDANCE: Record<PollutantKey, { what: string; effects: string; sources: string }> = {
  pm25: {
    what: "Fine particles smaller than 2.5 micrometers in diameter. Too small to see with the naked eye.",
    effects: "Can penetrate deep into the lungs and enter the bloodstream. Linked to cardiovascular disease, respiratory issues, and reduced lung function.",
    sources: "Vehicle exhaust, power plants, wood burning, industrial emissions.",
  },
  pm10: {
    what: "Coarse particles between 2.5 and 10 micrometers. Includes dust, pollen, and mold spores.",
    effects: "Can enter the respiratory system, causing irritation, coughing, and aggravating asthma.",
    sources: "Road dust, construction, agriculture, natural sources like sea spray.",
  },
  no2: {
    what: "Nitrogen dioxide — a reddish-brown gas with a sharp smell.",
    effects: "Irritates airways, aggravates respiratory diseases, and contributes to smog and acid rain formation.",
    sources: "Vehicle engines, power stations, industrial boilers.",
  },
  so2: {
    what: "Sulfur dioxide — a colorless gas with a pungent smell.",
    effects: "Causes respiratory irritation, can trigger asthma attacks, and contributes to acid rain.",
    sources: "Burning fossil fuels (coal, oil), metal smelting, volcanic eruptions.",
  },
  co: {
    what: "Carbon monoxide — an odorless, colorless gas.",
    effects: "Reduces oxygen delivery to organs. High concentrations can cause dizziness, nausea, and in severe cases be fatal.",
    sources: "Incomplete combustion: vehicles, gas stoves, fireplaces, generators.",
  },
  o3: {
    what: "Ground-level ozone — not to be confused with the protective stratospheric ozone layer.",
    effects: "Irritates airways, causes coughing, reduces lung function, and aggravates asthma.",
    sources: "Formed by chemical reactions between NOx and VOCs in sunlight. Not directly emitted.",
  },
};

export default function HealthPage() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 });

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      setData(json.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(coords.lat, coords.lon); }, [coords]);

  useEffect(() => {
    const handler = (e: CustomEvent) => setCoords(e.detail.coordinates);
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  const catInfo = data?.aqi.calculated ? getAQICategory(data.aqi.value) : null;

  const activityRecs = data?.aqi.calculated
    ? data.aqi.value <= 50
      ? { outdoor: "✅ Safe for all outdoor activities", exercise: "✅ Fine for vigorous exercise", window: "✅ Open windows for ventilation" }
      : data.aqi.value <= 100
      ? { outdoor: "⚠️ Generally fine; sensitive individuals be cautious", exercise: "⚠️ Sensitive groups: limit prolonged vigorous exercise", window: "✅ Moderate ventilation OK" }
      : data.aqi.value <= 150
      ? { outdoor: "⚠️ Sensitive groups should limit outdoor time", exercise: "🚫 Sensitive groups: avoid vigorous outdoor exercise", window: "⚠️ Limit ventilation; use air purifiers if available" }
      : { outdoor: "🚫 Everyone should minimize outdoor activities", exercise: "🚫 Avoid outdoor exercise; exercise indoors", window: "🚫 Keep windows closed; use air purifiers" }
    : { outdoor: "— AQI data unavailable", exercise: "— AQI data unavailable", window: "— AQI data unavailable" };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Health & Safety Insights</h1>
          <p className="text-sm text-slate-400 mt-1">General guidance based on current air quality conditions</p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            <strong>Important:</strong> This is general educational information only — not medical advice, diagnosis, or personalized medical treatment. Consult a healthcare professional for personal health decisions.
          </p>
        </div>

        {loading ? <LoadingState rows={3} /> : (
          <>
            {/* Current conditions summary */}
            {catInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Conditions</CardTitle>
                  <span className="text-xs" style={{ color: catInfo.color }}>AQI {data?.aqi.value}</span>
                </CardHeader>
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: catInfo.color }} />
                    <span className="font-semibold" style={{ color: catInfo.color }}>{catInfo.label}</span>
                  </div>
                  <p className="text-sm text-slate-300">{catInfo.advice}</p>
                </div>
              </Card>
            )}

            {/* Activity recommendations */}
            <Card>
              <CardHeader><CardTitle>Activity Recommendations</CardTitle></CardHeader>
              <div className="space-y-3">
                {[
                  { icon: Activity, label: "Outdoor Activities", value: activityRecs.outdoor },
                  { icon: Heart, label: "Exercise", value: activityRecs.exercise },
                  { icon: Wind, label: "Ventilation", value: activityRecs.window },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-700/40 rounded-xl">
                    <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-300">{item.label}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sensitive groups */}
            <Card>
              <CardHeader><CardTitle>Sensitive Groups — Extra Precautions</CardTitle></CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { group: "Children", tip: "Developing lungs are more vulnerable. Limit prolonged outdoor play when AQI is elevated." },
                  { group: "Elderly", tip: "Increased risk of cardiovascular complications. Monitor symptoms like shortness of breath." },
                  { group: "Asthma & Respiratory Conditions", tip: "Keep rescue inhalers accessible. Follow your doctor's action plan on high-pollution days." },
                  { group: "Heart Disease", tip: "Air pollution can trigger cardiac events. Limit strenuous outdoor activity when AQI is high." },
                  { group: "Pregnant Women", tip: "Exposure to pollutants may affect fetal development. Minimize exposure on high-AQI days." },
                  { group: "Outdoor Workers", tip: "Take regular breaks, wear appropriate masks (N95 or higher), and stay hydrated." },
                ].map((item) => (
                  <div key={item.group} className="p-3 bg-slate-700/40 rounded-xl">
                    <p className="text-sm font-medium text-orange-400 mb-1">{item.group}</p>
                    <p className="text-xs text-slate-400">{item.tip}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pollutant explainers */}
            <div>
              <h2 className="font-semibold text-slate-200 mb-4">Understanding Pollutants</h2>
              <div className="space-y-3">
                {(Object.keys(HEALTH_GUIDANCE) as PollutantKey[]).map((p) => {
                  const info = HEALTH_GUIDANCE[p];
                  const pollutantInfo = POLLUTANTS[p];
                  return (
                    <Card key={p} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-xl font-bold text-emerald-400 w-12 shrink-0 text-center">
                          {pollutantInfo.name}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200 mb-1">{pollutantInfo.fullName}</p>
                          <p className="text-xs text-slate-400 mb-2">{info.what}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                              <p className="text-xs font-medium text-red-400 mb-1">Health Effects</p>
                              <p className="text-xs text-slate-400">{info.effects}</p>
                            </div>
                            <div className="p-2 bg-slate-700/50 rounded-lg">
                              <p className="text-xs font-medium text-slate-300 mb-1">Common Sources</p>
                              <p className="text-xs text-slate-400">{info.sources}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

