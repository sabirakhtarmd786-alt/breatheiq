"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { DemoBanner, LoadingState } from "@/components/shared/States";
import type { Station } from "@/types";
import { POLLUTANTS } from "@/lib/constants/aqi";
import { formatTimestamp } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  "very-high": "#ef4444",
  unknown: "#64748b",
};

function getStationColor(station: Station): string {
  const m = (station.measurements || station.pollutants || {}) as Record<string, any>;
  const pm25 = m.pm25?.value ?? m.pm2_5?.value ?? (typeof m.pm2_5 === 'number' ? m.pm2_5 : undefined);
  if (pm25 === undefined) return SEVERITY_COLORS.unknown;
  if (pm25 < 15) return SEVERITY_COLORS.low;
  if (pm25 < 35) return SEVERITY_COLORS.moderate;
  if (pm25 < 55) return SEVERITY_COLORS.high;
  return SEVERITY_COLORS["very-high"];
}

export default function AirQualityMap() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209]);

  const fetchStations = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stations?lat=${lat}&lon=${lon}&radius=50000`);
      const json = await res.json();
      setStations(json.data || []);
      setIsDemo(json.isDemo || false);
    } catch {
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations(center[0], center[1]);
  }, [center, fetchStations]);

  // Listen for location changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { coordinates } = e.detail;
      setCenter([coordinates.lat, coordinates.lon]);
    };
    window.addEventListener("breatheiq:location-change", handler as EventListener);
    return () => window.removeEventListener("breatheiq:location-change", handler as EventListener);
  }, []);

  return (
    <div className="space-y-4">
      {isDemo && <DemoBanner />}

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap text-xs text-slate-400">
        <span className="font-medium text-slate-300">PM2.5 Severity:</span>
        {[
          { label: "Good (<15)", color: SEVERITY_COLORS.low },
          { label: "Moderate (<35)", color: SEVERITY_COLORS.moderate },
          { label: "High (<55)", color: SEVERITY_COLORS.high },
          { label: "Very High (55+)", color: SEVERITY_COLORS["very-high"] },
          { label: "No PM2.5 data", color: SEVERITY_COLORS.unknown },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/50 h-[65vh]">
        <MapContainer
          center={center}
          zoom={11}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
          />

          {stations.map((station) => {
            const lat = station.coordinates?.lat ?? station.latitude;
            const lon = station.coordinates?.lon ?? station.longitude;
            if (lat === undefined || lon === undefined) return null;
            return (
              <CircleMarker
                key={station.id}
                center={[lat, lon]}
                radius={12}
                pathOptions={{
                  fillColor: getStationColor(station),
                  color: "#0f172a",
                  weight: 2,
                  fillOpacity: 0.85,
                }}
              >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{station.name}</h3>
                  {station.city && (
                    <p className="text-xs text-gray-500 mb-2">
                      {station.city}
                      {station.country ? `, ${station.country}` : ""}
                    </p>
                  )}
                  <div className="space-y-1">
                    {Object.entries((station.measurements || station.pollutants || {}) as Record<string, any>).map(([key, m]) => {
                      if (!m) return null;
                      const pKey = (m.pollutant || key) as keyof typeof POLLUTANTS;
                      const info = POLLUTANTS[pKey] || { name: key.toUpperCase(), unit: "µg/m³" };
                      const val = typeof m === 'number' ? m : m.value;
                      if (val === undefined) return null;
                      return (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="font-medium">{info.name}</span>
                          <span>
                            {Number(val).toFixed(1)} {info.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {station.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-2 border-t pt-2">
                      {formatTimestamp(station.lastUpdated)}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Source: {isDemo ? "Demo Data" : "OpenAQ v3"}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500 text-center">
        {loading
          ? "Loading stations…"
          : `${stations.length} station(s) shown · Map data © OpenStreetMap contributors · Station data: ${isDemo ? "Demo Data" : "OpenAQ v3"}`}
      </p>
    </div>
  );
}

