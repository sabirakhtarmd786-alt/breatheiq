'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { ForecastDataPoint } from '@/types';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { 
  CloudSun, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Sun, 
  Sparkles, 
  ChevronRight, 
  RotateCw,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';

export function ForecastView() {
  const { currentLocation } = useLocation();

  const [data, setData] = useState<{ daily: ForecastDataPoint[]; hourly: any[]; source: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/forecast?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`
      );
      if (!res.ok) throw new Error('Failed to retrieve forecast projections.');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching forecast:', err);
      setError(err.message || 'Could not load atmospheric forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [currentLocation]);

  // Hourly curve for next 48 hours
  const hourlyData48 = (data?.hourly || []).slice(0, 48).map((h) => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day: new Date(h.time).toLocaleDateString([], { weekday: 'short' }),
    aqi: h.aqi,
    pm2_5: h.pm2_5,
    pm10: h.pm10,
    fullTime: h.time,
  }));

  // Best projected window in the next 24 hours (lowest AQI)
  const bestWindow = hourlyData48.slice(0, 24).reduce((min, curr) => (curr.aqi < min.aqi ? curr : min), hourlyData48[0] || { aqi: 100, time: '14:00' });

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudSun className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              7-Day Air Quality Predictive Forecast
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Atmospheric numerical simulation for {currentLocation.name}. Powered by European Copernicus (CAMS) Air Quality Models.
          </p>
        </div>

        {/* Distinct Forecast Label */}
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            Model Projection • Not Ground Sensor
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchForecast} isLoading={isLoading} className="text-xs">
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Best Outdoor Activity Window Card */}
      {bestWindow && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Recommended Outdoor Window (Next 24 Hours)
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Best projected air quality around <strong className="text-emerald-400">{bestWindow.time}</strong> with estimated AQI ~{bestWindow.aqi}.
              </div>
            </div>
          </div>
          <Badge variant="success" size="sm">
            Optimal Ventilation Time
          </Badge>
        </div>
      )}

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {(data?.daily || []).map((day, idx) => {
          const color = getAQIColorHex(day.category);
          const isSelected = selectedDay === idx;

          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDay(idx)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg dark:bg-navy-850 dark:border-emerald-400'
                  : 'bg-white dark:bg-navy-900/80 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {day.dayLabel}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(day.dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="my-3">
                <span 
                  className="text-2xl font-extrabold block"
                  style={{ color }}
                >
                  {day.aqi}
                </span>
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider block truncate"
                  style={{ color }}
                >
                  {day.category}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-navy-800 text-[10px] text-slate-400">
                PM2.5: {day.pm2_5} µg/m³
              </div>
            </button>
          );
        })}
      </div>

      {/* 48-Hour Hourly Predictive Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="text-base sm:text-lg">
              48-Hour Chronological Pollution Projection
            </CardTitle>
            <CardDescription>
              Hourly model trajectory forecasting particulate surges, daytime dispersion, and nocturnal inversions.
            </CardDescription>
          </div>
          <Badge variant="neutral" size="sm">
            48 Hours Ahead
          </Badge>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData48} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
              <XAxis 
                dataKey="time" 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-navy-900 border border-navy-700 shadow-xl text-xs space-y-1">
                        <span className="text-slate-400 font-semibold block">{item.day}, {item.time}</span>
                        <div className="text-emerald-400 font-bold text-sm">Projected AQI: {item.aqi}</div>
                        <div className="text-slate-300">PM2.5: {item.pm2_5} µg/m³ • PM10: {item.pm10} µg/m³</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Moderate Limit', fill: '#F59E0B', fontSize: 10 }} />
              <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy Limit', fill: '#EF4444', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Attribution & Forecast Integrity Note */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          Forecast Methodology & Boundary Conditions:
        </div>
        <p className="leading-relaxed">
          Forecasts are derived from European CAMS (Copernicus Atmosphere Monitoring Service) global Eulerian chemical transport models combining satellite aerosol optical depth (AOD), meteorology, and emission inventories. Forecast values represent model estimates and may vary from ground-sensor measurements during rapid local biomass burning or firework events.
        </p>
      </div>
    </div>
  );
}
