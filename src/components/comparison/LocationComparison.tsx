'use client';

import React, { useState, useEffect } from 'react';
import { useLocation, DEFAULT_LOCATIONS } from '@/context/LocationContext';
import { LocationData, AirQualityData, PollutantKey } from '@/types';
import { 
  GitCompare, 
  Plus, 
  X, 
  Check, 
  ArrowRight, 
  RotateCw, 
  Search, 
  ShieldCheck, 
  Info,
  Award,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface ComparisonCityState {
  location: LocationData;
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
}

const COMPARISON_COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

export function LocationComparison() {
  const { currentLocation } = useLocation();

  // Compare 2 to 3 cities (default: Current location vs Mumbai vs Bengaluru)
  const [selectedCities, setSelectedCities] = useState<ComparisonCityState[]>([
    {
      location: currentLocation,
      data: null,
      loading: true,
      error: null,
    },
    {
      location: DEFAULT_LOCATIONS.find(l => l.name !== currentLocation.name) || DEFAULT_LOCATIONS[1],
      data: null,
      loading: true,
      error: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch data for a city
  const fetchCityData = async (index: number, loc: LocationData) => {
    setSelectedCities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], location: loc, loading: true, error: null };
      return updated;
    });

    try {
      const res = await fetch(
        `/api/air-quality?lat=${loc.latitude}&lon=${loc.longitude}&city=${encodeURIComponent(
          loc.name
        )}&country=${encodeURIComponent(loc.country || 'India')}`
      );
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();

      setSelectedCities((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], data: json, loading: false };
        return updated;
      });
    } catch (err: any) {
      setSelectedCities((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], loading: false, error: 'Could not load data' };
        return updated;
      });
    }
  };

  // Initial load
  useEffect(() => {
    selectedCities.forEach((c, idx) => {
      fetchCityData(idx, c.location);
    });
  }, []);

  // Update first city when global location changes
  useEffect(() => {
    if (selectedCities[0]?.location.id !== currentLocation.id) {
      fetchCityData(0, currentLocation);
    }
  }, [currentLocation]);

  // Debounced search for adding new cities
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery.trim()
          )}&count=4&language=en&format=json`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            setSearchResults(
              json.results.map((r: any) => ({
                id: `${r.latitude}_${r.longitude}`,
                name: r.name,
                country: r.country || '',
                latitude: r.latitude,
                longitude: r.longitude,
                admin1: r.admin1,
              }))
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddCity = (loc: LocationData) => {
    if (selectedCities.length >= 3) return;
    const newIndex = selectedCities.length;
    setSelectedCities((prev) => [...prev, { location: loc, data: null, loading: true, error: null }]);
    fetchCityData(newIndex, loc);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleRemoveCity = (index: number) => {
    if (selectedCities.length <= 2) return;
    setSelectedCities((prev) => prev.filter((_, i) => i !== index));
  };

  // Find city with lowest AQI (cleanest)
  const validData = selectedCities.filter((c) => c.data && !c.loading);
  const cleanestCity = validData.length > 0 
    ? validData.reduce((prev, curr) => (curr.data!.aqi.value < prev.data!.aqi.value ? curr : prev))
    : null;

  // Comparison Bar Chart Dataset
  const chartData = [
    {
      pollutant: 'PM2.5',
      unit: 'µg/m³',
      ...selectedCities.reduce((acc, c, idx) => {
        acc[`city_${idx}`] = c.data?.pollutants.pm2_5.value ?? 0;
        return acc;
      }, {} as any),
    },
    {
      pollutant: 'PM10',
      unit: 'µg/m³',
      ...selectedCities.reduce((acc, c, idx) => {
        acc[`city_${idx}`] = c.data?.pollutants.pm10.value ?? 0;
        return acc;
      }, {} as any),
    },
    {
      pollutant: 'NO2',
      unit: 'µg/m³',
      ...selectedCities.reduce((acc, c, idx) => {
        acc[`city_${idx}`] = c.data?.pollutants.no2.value ?? 0;
        return acc;
      }, {} as any),
    },
    {
      pollutant: 'SO2',
      unit: 'µg/m³',
      ...selectedCities.reduce((acc, c, idx) => {
        acc[`city_${idx}`] = c.data?.pollutants.so2.value ?? 0;
        return acc;
      }, {} as any),
    },
    {
      pollutant: 'O3',
      unit: 'µg/m³',
      ...selectedCities.reduce((acc, c, idx) => {
        acc[`city_${idx}`] = c.data?.pollutants.o3.value ?? 0;
        return acc;
      }, {} as any),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Multi-Location Air Quality Comparison
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Side-by-side criteria pollutant evaluation and relative clean-air benchmarking.
          </p>
        </div>

        {/* Add City Button */}
        {selectedCities.length < 3 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add 3rd Location
            </Button>

            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl p-3 z-50">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city to compare..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                {isSearching ? (
                  <div className="p-2 text-center text-xs text-slate-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleAddCity(r)}
                        className="w-full px-2.5 py-1.5 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {r.name}, {r.country}
                        </span>
                        <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-2 text-center text-xs text-slate-400">No results found</div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Presets</span>
                    {DEFAULT_LOCATIONS.filter(l => !selectedCities.some(c => c.location.name === l.name)).slice(0, 3).map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleAddCity(l)}
                        className="w-full px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-navy-800 rounded flex justify-between"
                      >
                        <span>{l.name}</span>
                        <Plus className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cleanest Location Winner Banner */}
      {cleanestCity && validData.length >= 2 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Cleaner Measured Air Quality
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {cleanestCity.location.name} is currently cleaner with an AQI of {cleanestCity.data?.aqi.value} ({cleanestCity.data?.aqi.label})
              </div>
            </div>
          </div>
          <Badge variant="success" size="md">
            Dominant Clean Factor: Lower PM2.5
          </Badge>
        </div>
      )}

      {/* Side-by-Side City Overview Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${selectedCities.length} gap-4`}>
        {selectedCities.map((item, idx) => {
          const color = COMPARISON_COLORS[idx];
          return (
            <Card key={idx} className="p-5 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: color }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }} 
                  />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {item.location.name}
                  </h3>
                </div>

                {selectedCities.length > 2 && (
                  <button
                    onClick={() => handleRemoveCity(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove location"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {item.loading ? (
                <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <RotateCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading telemetry...</span>
                </div>
              ) : item.data ? (
                <div className="space-y-4">
                  {/* Big AQI Number */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span 
                        className="text-4xl font-black"
                        style={{ color: item.data.aqi.color }}
                      >
                        {item.data.aqi.value}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5 font-semibold">
                        US AQI
                      </span>
                    </div>

                    <span 
                      className="text-xs font-bold px-2.5 py-1 rounded-lg border"
                      style={{
                        backgroundColor: `${item.data.aqi.color}15`,
                        borderColor: `${item.data.aqi.color}30`,
                        color: item.data.aqi.color,
                      }}
                    >
                      {item.data.aqi.label}
                    </span>
                  </div>

                  {/* Pollutant Summary Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                      <span className="text-slate-400 block text-[10px]">PM2.5</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.data.pollutants.pm2_5.value} µg/m³
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                      <span className="text-slate-400 block text-[10px]">PM10</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.data.pollutants.pm10.value} µg/m³
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                      <span className="text-slate-400 block text-[10px]">NO2</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.data.pollutants.no2.value} µg/m³
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                      <span className="text-slate-400 block text-[10px]">Dominant</span>
                      <span className="font-bold text-emerald-400 uppercase text-[11px]">
                        {item.data.aqi.dominantPollutant.replace('_', '.')}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800 truncate">
                    Source: {item.data.source}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-rose-400">
                  Data unavailable
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Interactive Side-by-Side Comparison Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base sm:text-lg">
            Criteria Pollutant Concentrations Breakdown
          </CardTitle>
          <CardDescription>
            Direct comparison of atmospheric particulate and gas concentrations (µg/m³).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
                <XAxis dataKey="pollutant" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-navy-900 border border-navy-700 shadow-xl text-xs space-y-1.5">
                          <span className="font-bold text-white block border-b border-navy-800 pb-1">
                            {label} Concentration (µg/m³)
                          </span>
                          {payload.map((entry: any, i: number) => {
                            const cName = selectedCities[i]?.location.name || `Location ${i + 1}`;
                            return (
                              <div key={i} className="flex justify-between gap-4">
                                <span style={{ color: entry.color }}>{cName}:</span>
                                <strong className="text-white">{entry.value} µg/m³</strong>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value: string) => {
                    const idx = parseInt(value.replace('city_', ''), 10);
                    return selectedCities[idx]?.location.name || value;
                  }}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                {selectedCities.map((_, idx) => (
                  <Bar
                    key={idx}
                    dataKey={`city_${idx}`}
                    fill={COMPARISON_COLORS[idx]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Methodology Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          Comparability & Methodology Note:
        </div>
        <p className="leading-relaxed">
          Comparisons are normalized to the US EPA Air Quality Index framework. Local atmospheric boundary conditions (e.g., coastal marine inversions in Mumbai vs continental winter trapping in Delhi) significantly influence dispersion rates.
        </p>
      </div>
    </div>
  );
}
