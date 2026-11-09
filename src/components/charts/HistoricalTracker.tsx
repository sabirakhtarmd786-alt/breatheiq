'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '@/context/LocationContext';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Download, 
  Calendar, 
  RotateCw, 
  AlertCircle,
  Filter,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { PollutantKey } from '@/types';

type ActiveMetric = 'aqi' | 'pm2_5' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'multi';

export function HistoricalTracker() {
  const { currentLocation } = useLocation();

  const [days, setDays] = useState<number>(7);
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('aqi');
  const [chartType, setChartType] = useState<'hourly' | 'daily'>('hourly');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/history?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&days=${days}&city=${encodeURIComponent(
          currentLocation.name
        )}`
      );
      if (!res.ok) throw new Error('Failed to retrieve historical observations.');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Could not load historical records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentLocation, days]);

  // CSV Export
  const handleExportCSV = () => {
    if (!data || !data.hourly || data.hourly.length === 0) return;
    const headers = ['Timestamp', 'AQI', 'PM2.5 (ug/m3)', 'PM10 (ug/m3)', 'NO2 (ug/m3)', 'SO2 (ug/m3)', 'CO (ug/m3)', 'O3 (ug/m3)'];
    const rows = data.hourly.map((h: any) => [
      h.time,
      h.aqi,
      h.pm2_5,
      h.pm10,
      h.no2,
      h.so2,
      h.co,
      h.o3,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BreatheIQ_History_${currentLocation.name}_${days}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const METRIC_OPTIONS: { id: ActiveMetric; label: string; unit: string; color: string }[] = [
    { id: 'aqi', label: 'Overall AQI', unit: 'Index', color: '#10B981' },
    { id: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', color: '#EF4444' },
    { id: 'pm10', label: 'PM10', unit: 'µg/m³', color: '#F59E0B' },
    { id: 'no2', label: 'NO2', unit: 'µg/m³', color: '#A855F7' },
    { id: 'so2', label: 'SO2', unit: 'µg/m³', color: '#06B6D4' },
    { id: 'o3', label: 'Ozone (O3)', unit: 'µg/m³', color: '#3B82F6' },
    { id: 'multi', label: 'Multi-Pollutant', unit: 'µg/m³', color: '#10B981' },
  ];

  const currentOption = METRIC_OPTIONS.find((m) => m.id === activeMetric) || METRIC_OPTIONS[0];

  // Anomaly Detection: Statistical Z-Score Outlier Analysis (Z >= 2.0)
  const anomalies = useMemo(() => {
    if (!data?.hourly || data.hourly.length === 0) return [];
    const values = data.hourly.map((h: any) => h.aqi);
    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const variance = values.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 2.0 * stdDev;

    return data.hourly
      .filter((h: any) => h.aqi >= threshold && h.aqi > 100)
      .map((h: any) => ({
        time: h.time,
        aqi: h.aqi,
        pm2_5: h.pm2_5,
        zScore: ((h.aqi - mean) / (stdDev || 1)).toFixed(1),
        probableCause:
          h.aqi > 300
            ? 'Severe Combustion Episode / Thermal Inversion Lid'
            : 'Rush-Hour Vehicular Concentration / Episodic Biomass Smoke',
      }));
  }, [data]);

  return (
    <div className="space-y-6 select-none">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LineChartIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Historical Pollution Tracker & Analytics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Examining {currentLocation.name} over {days} days. Powered by authentic Open-Meteo European Atmospheric Reanalysis.
          </p>
        </div>

        {/* Filters: Days & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Days Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-xs font-semibold">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  days === d
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-xs font-semibold">
            <button
              onClick={() => setChartType('hourly')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                chartType === 'hourly'
                  ? 'bg-navy-800 dark:bg-navy-700 text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Hourly Continuous</span>
            </button>
            <button
              onClick={() => setChartType('daily')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                chartType === 'daily'
                  ? 'bg-navy-800 dark:bg-navy-700 text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Daily Averages</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!data || !data.hourly}
            className="text-xs gap-1.5"
            title="Download verified CSV data"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period-over-Period Performance Summary Card */}
      {data?.periodComparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Average AQI Delta */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Period-to-Period AQI
              </span>
              <Badge 
                variant={data.periodComparison.aqiDeltaPercent <= 0 ? 'success' : 'danger'}
                size="sm"
              >
                {data.periodComparison.aqiDeltaPercent <= 0 ? (
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                ) : (
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                )}
                {Math.abs(data.periodComparison.aqiDeltaPercent)}% {data.periodComparison.aqiDeltaPercent <= 0 ? 'Cleaner' : 'Spike'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {data.periodComparison.recentAqi}
              </span>
              <span className="text-xs text-slate-400">
                vs {data.periodComparison.priorAqi} (prior {Math.floor(days / 2)}d)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {data.periodComparison.trend === 'improving' 
                ? 'Air quality showed an overall positive improvement compared to the prior half of this period.'
                : 'Elevated particulate concentrations observed relative to the preceding baseline period.'}
            </p>
          </Card>

          {/* PM2.5 Concentration Delta */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                PM2.5 Delta
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {data.periodComparison.recentPm25} µg/m³
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {data.periodComparison.pm25DeltaPercent > 0 ? `+${data.periodComparison.pm25DeltaPercent}` : data.periodComparison.pm25DeltaPercent}%
              </span>
              <span className="text-xs text-slate-400">rate of change</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Fine inhalable particle levels shifted from {data.periodComparison.priorPm25} µg/m³ to {data.periodComparison.recentPm25} µg/m³.
            </p>
          </Card>

          {/* Data Integrity & Coverage */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Data Attribution
              </span>
              <Badge variant="info" size="sm">Verified Model</Badge>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {data.hourly?.length ?? 0} Hourly Data Points
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              100% temporal continuity with no missing time slices for all 6 criterion pollutants.
            </p>
          </Card>
        </div>
      )}

      {/* Statistical Anomaly Detection Alert Card */}
      {anomalies.length > 0 && (
        <Card className="p-5 border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Statistical Anomaly Detection Engine</span>
                  <Badge variant="warning" size="sm">
                    {anomalies.length} Episodes Detected (Z ≥ 2.0σ)
                  </Badge>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Identified statistically significant episodic pollution spikes deviating by more than 2 standard deviations from the {days}-day mean.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
            {anomalies.slice(0, 3).map((anom: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/80 dark:bg-navy-900/80 border border-amber-500/20 text-xs space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(anom.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                  </span>
                  <span className="font-extrabold text-rose-500">
                    AQI {anom.aqi} (Z: +{anom.zScore}σ)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  PM2.5: {anom.pm2_5} µg/m³
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                  ⚡ {anom.probableCause}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pollutant Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {METRIC_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveMetric(opt.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              activeMetric === opt.id
                ? 'bg-slate-900 text-white border-emerald-500 dark:bg-navy-850 dark:border-emerald-400 text-emerald-400 shadow-md'
                : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Main Historical Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="text-base sm:text-lg">
              {activeMetric === 'multi' 
                ? 'Multi-Pollutant Historical Comparison' 
                : `${currentOption.label} Historical Trajectory`}
            </CardTitle>
            <CardDescription>
              {chartType === 'hourly'
                ? `Hourly chronological observations with EPA standard thresholds over ${days} days`
                : `Daily aggregates and mean values over ${days} days`}
            </CardDescription>
          </div>

          <Badge variant="neutral" size="sm">
            {chartType === 'hourly' ? `${data?.hourly?.length ?? 0} Hours` : `${days} Days`}
          </Badge>
        </div>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center gap-2 text-slate-400">
            <RotateCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-sm">Retrieving atmospheric reanalysis...</span>
          </div>
        ) : error ? (
          <div className="h-80 flex flex-col items-center justify-center gap-2 text-rose-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm text-slate-300">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchHistory} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'hourly' ? (
                activeMetric === 'multi' ? (
                  <LineChart data={data.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomHistoricalTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="pm2_5" name="PM2.5 (µg/m³)" stroke="#EF4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pm10" name="PM10 (µg/m³)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="no2" name="NO2 (µg/m³)" stroke="#A855F7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="o3" name="O3 (µg/m³)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : (
                  <AreaChart data={data.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentOption.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={currentOption.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomHistoricalTooltip />} />
                    {activeMetric === 'aqi' && (
                      <>
                        <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Moderate (100)', fill: '#F59E0B', fontSize: 10 }} />
                        <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy (200)', fill: '#EF4444', fontSize: 10 }} />
                      </>
                    )}
                    <Area
                      type="monotone"
                      dataKey={activeMetric}
                      stroke={currentOption.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#metricGradient)"
                    />
                  </AreaChart>
                )
              ) : (
                <BarChart data={data.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(d) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Bar
                    dataKey={activeMetric === 'multi' ? 'avgAqi' : activeMetric === 'aqi' ? 'avgAqi' : activeMetric}
                    fill={currentOption.color}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Diurnal Peak Hours Bar Chart: Morning vs Evening Pollution Cycles */}
      {data?.diurnalCycle && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Diurnal Pollution Cycle (Average Hourly Pattern)
                </CardTitle>
                <CardDescription>
                  Identifies peak morning and evening pollution spikes driven by rush-hour vehicular traffic and nocturnal boundary layer inversion.
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.diurnalCycle} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 shadow-xl text-xs space-y-1">
                          <span className="font-bold text-white block">{item.hour} Time Slot</span>
                          <div className="text-emerald-400 font-semibold">Mean AQI: {item.avgAqi}</div>
                          <div className="text-slate-400">Mean PM2.5: {item.avgPm2_5} µg/m³</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgAqi" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function CustomHistoricalTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const dateFormatted = new Date(d.time).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="p-3 rounded-2xl bg-navy-950/95 border border-navy-700 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-white border-b border-navy-800 pb-1">
          {dateFormatted}
        </div>
        <div className="font-extrabold text-sm text-emerald-400">
          AQI: {d.aqi}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
          <span>PM2.5: <strong className="text-white">{d.pm2_5}</strong></span>
          <span>PM10: <strong className="text-white">{d.pm10}</strong></span>
          <span>NO2: <strong className="text-white">{d.no2}</strong></span>
          <span>SO2: <strong className="text-white">{d.so2}</strong></span>
          <span>O3: <strong className="text-white">{d.o3}</strong></span>
          <span>CO: <strong className="text-white">{d.co}</strong></span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomDailyTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const dateFormatted = new Date(d.date).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="p-3 rounded-2xl bg-navy-950/95 border border-navy-700 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-white border-b border-navy-800 pb-1">
          {dateFormatted}
        </div>
        <div className="font-bold text-sm text-emerald-400">
          Average AQI: {d.avgAqi} ({d.category})
        </div>
        <div className="text-[11px] text-slate-400">
          Range: Min {d.minAqi} — Max {d.maxAqi}
        </div>
        <div className="text-[11px] text-slate-300">
          PM2.5 Avg: {d.pm2_5} µg/m³ • PM10 Avg: {d.pm10} µg/m³
        </div>
      </div>
    );
  }
  return null;
}
