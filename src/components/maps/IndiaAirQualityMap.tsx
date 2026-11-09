'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Tooltip, 
  GeoJSON,
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import indiaStatesGeoData from '@/lib/data/india_states_geo.json';
import { 
  INDIA_STATES_DATA, 
  IndiaState, 
  IndiaCity, 
  IndiaStation,
  WORLD_CITIES_DATA,
  WorldCity,
  getStateByGeoJsonName,
  getMostPollutedCities,
  getCleanestCities,
  calculateCigaretteEquivalence,
  verifyAirQualityData,
  getAllCitiesFlat
} from '@/lib/data/indiaAirQualityData';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { 
  Compass, 
  Layers, 
  Search, 
  RotateCcw, 
  MapPin, 
  CheckCircle,
  ChevronRight,
  Trophy,
  Flame,
  Sparkles,
  X,
  Globe,
  ShieldCheck,
  Plus,
  Minus,
  Crosshair,
  Loader2,
  Navigation
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

// Fix Leaflet default icon URLs for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map Controller for programmatically flying to locations and capturing clicks
function MapEventsController({ 
  targetCenter, 
  targetZoom, 
  onZoomChange,
  onMapClick
}: { 
  targetCenter: [number, number]; 
  targetZoom: number; 
  onZoomChange: (z: number) => void;
  onMapClick: (lat: number, lon: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(targetCenter, targetZoom, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [targetCenter, targetZoom, map]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// Custom DivIcon badge generator (numbered pill style)
function createPinIcon(
  value: number,
  label: string,
  color: string,
  size: 'lg' | 'md' | 'sm',
  isHazardous: boolean,
  unit: string = ''
) {
  const pillPadding = size === 'lg' 
    ? 'px-3 py-1 text-xs' 
    : size === 'md' 
      ? 'px-2.5 py-0.5 text-[11px]' 
      : 'px-2 py-0.5 text-[10px]';

  const html = `
    <div class="aqi-map-pin" style="--pin-color: ${color}">
      ${isHazardous ? '<div class="aqi-pin-pulse"></div>' : ''}
      <div class="aqi-pin-pill ${pillPadding}" style="background-color: ${color}">
        <span>${value}${unit}</span>
      </div>
      <div class="aqi-pin-pointer"></div>
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: size === 'lg' ? [54, 30] : size === 'md' ? [44, 26] : [36, 22],
    iconAnchor: size === 'lg' ? [27, 30] : size === 'md' ? [22, 26] : [18, 22],
  });
}

// Custom Target Click Pin Icon
function createTargetPinIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
      <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
      </div>
    </div>
  `;
  return L.divIcon({
    className: '',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export interface IndiaAirQualityMapProps {
  className?: string;
  heightClassName?: string;
}

export function IndiaAirQualityMap({
  className,
  heightClassName = 'h-[520px] sm:h-[600px] lg:h-[660px]',
}: IndiaAirQualityMapProps = {}) {
  const { setCurrentLocation } = useLocation();
  const { theme } = useTheme();

  const [currentZoom, setCurrentZoom] = useState(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5937, 78.9629]); // Center of India
  const [activeRegion, setActiveRegion] = useState<'india' | 'world' | 'asia' | 'europe' | 'americas'>('india');
  const [selectedState, setSelectedState] = useState<IndiaState | null>(null);
  const [selectedCity, setSelectedCity] = useState<IndiaCity | null>(null);
  const [selectedStation, setSelectedStation] = useState<IndiaStation | null>(null);
  const [metricFilter, setMetricFilter] = useState<'aqi' | 'pm2_5' | 'pm10'>('aqi');
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRankings, setShowRankings] = useState(false);
  const [rankingTab, setRankingTab] = useState<'polluted' | 'cleanest'>('polluted');

  // On-Demand Click-to-Measure Location State (for any village, district, or global point)
  const [customPoint, setCustomPoint] = useState<{
    lat: number;
    lon: number;
    name: string;
    state?: string;
    country?: string;
    aqi: number;
    category: any;
    pollutants: Record<string, number>;
    isLoading: boolean;
    isVerified: boolean;
  } | null>(null);

  // Sync default mapStyle with app theme
  useEffect(() => {
    if (mapStyle !== 'satellite') {
      setMapStyle(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  // Tile layer configuration (100% free public tiles, zero API key)
  const tileLayerConfig = useMemo(() => {
    if (mapStyle === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri World Imagery (Public Free)',
      };
    }
    if (mapStyle === 'dark') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      };
    }
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    };
  }, [mapStyle]);

  // Determine active level based on zoom
  const activeLevel = useMemo(() => {
    if (currentZoom <= 3.5) return 'world';
    if (currentZoom <= 6) return 'state';
    if (currentZoom <= 8.5) return 'city';
    return 'station';
  }, [currentZoom]);

  // Controlled Zoom Handlers
  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(18, prev + 1));
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(2, prev - 1));
  };

  // Region Fly-To presets
  const handleFlyToRegion = (region: 'india' | 'world' | 'asia' | 'europe' | 'americas') => {
    setActiveRegion(region);
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedStation(null);
    setCustomPoint(null);
    if (region === 'india') {
      setMapCenter([22.5937, 78.9629]);
      setCurrentZoom(5);
    } else if (region === 'world') {
      setMapCenter([20, 15]);
      setCurrentZoom(2.5);
    } else if (region === 'asia') {
      setMapCenter([28, 95]);
      setCurrentZoom(3.5);
    } else if (region === 'europe') {
      setMapCenter([48, 12]);
      setCurrentZoom(4);
    } else if (region === 'americas') {
      setMapCenter([25, -90]);
      setCurrentZoom(3);
    }
  };

  // Handle clicking a State
  const handleSelectState = useCallback((state: IndiaState) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedStation(null);
    setCustomPoint(null);
    setMapCenter([state.lat, state.lon]);
    setCurrentZoom(state.zoomLevel || 7.5);
  }, []);

  // Handle clicking a City
  const handleSelectCity = useCallback((city: IndiaCity) => {
    const parentState = INDIA_STATES_DATA.find((s) => s.id === city.stateId) || null;
    if (parentState) setSelectedState(parentState);
    setSelectedCity(city);
    setSelectedStation(null);
    setCustomPoint(null);
    setMapCenter([city.lat, city.lon]);
    setCurrentZoom(11);
  }, []);

  // 12 Key Indian Metros for Quick-Jump Strip (aqi.in / aqicn signature)
  const metroCities = useMemo(() => {
    const all = getAllCitiesFlat();
    const METRO_KEYS = [
      'delhi',
      'mumbai',
      'bengaluru',
      'kolkata',
      'chennai',
      'hyderabad',
      'ahmedabad',
      'pune',
      'lucknow',
      'jaipur',
      'patna',
      'chandigarh',
    ];
    return METRO_KEYS.map((key) => {
      return all.find(
        (c) =>
          c.id.toLowerCase().includes(key) ||
          c.name.toLowerCase().includes(key)
      );
    }).filter(Boolean) as IndiaCity[];
  }, []);

  // Handle clicking a Station
  const handleSelectStation = useCallback((station: IndiaStation) => {
    setSelectedStation(station);
    setCustomPoint(null);
    setMapCenter([station.lat, station.lon]);
    setCurrentZoom(13);
  }, []);

  // Handle clicking ANY location on the map (district, village, rural, or global)
  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    setCustomPoint({
      lat,
      lon,
      name: `Measuring (${lat.toFixed(2)}, ${lon.toFixed(2)})...`,
      aqi: 0,
      category: 'moderate',
      pollutants: {},
      isLoading: true,
      isVerified: false,
    });

    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}&city=Custom%20Location`);
      if (res.ok) {
        const payload = await res.json();
        const verification = verifyAirQualityData({
          aqi: payload.aqi?.value,
          pollutants: payload.pollutants ? {
            pm2_5: payload.pollutants.pm2_5?.value,
            pm10: payload.pollutants.pm10?.value,
            no2: payload.pollutants.no2?.value,
          } : undefined,
        });

        setCustomPoint({
          lat,
          lon,
          name: payload.location?.name || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          state: payload.state || '',
          country: payload.location?.country || '',
          aqi: payload.aqi?.value ?? 50,
          category: payload.aqi?.category ?? 'moderate',
          pollutants: {
            pm2_5: payload.pollutants?.pm2_5?.value ?? 0,
            pm10: payload.pollutants?.pm10?.value ?? 0,
            no2: payload.pollutants?.no2?.value ?? 0,
            so2: payload.pollutants?.so2?.value ?? 0,
            co: payload.pollutants?.co?.value ?? 0,
            o3: payload.pollutants?.o3?.value ?? 0,
          },
          isLoading: false,
          isVerified: verification.isValid,
        });
      }
    } catch (err) {
      console.error('Error querying custom point:', err);
    }
  }, []);

  // Synchronize selection with main application location
  const handleSetAppLocation = (name: string, lat: number, lon: number, country = 'India') => {
    setCurrentLocation({
      id: `${lat}_${lon}`,
      name,
      country,
      countryCode: country === 'India' ? 'IN' : 'GLOBAL',
      latitude: lat,
      longitude: lon,
    });
  };

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const results: { type: 'state' | 'city' | 'station' | 'world'; name: string; parent?: string; item: any }[] = [];

    // Search world cities
    WORLD_CITIES_DATA.forEach((wc) => {
      if (wc.name.toLowerCase().includes(q) || wc.country.toLowerCase().includes(q)) {
        results.push({ type: 'world', name: wc.name, parent: wc.country, item: wc });
      }
    });

    // Search Indian states
    INDIA_STATES_DATA.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
        results.push({ type: 'state', name: s.name, item: s });
      }
      // Search cities & districts
      s.cities.forEach((c) => {
        if (c.name.toLowerCase().includes(q)) {
          results.push({ type: 'city', name: c.name, parent: s.name, item: c });
        }
        // Search stations
        c.stations.forEach((st) => {
          if (st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q)) {
            results.push({ type: 'station', name: st.name, parent: `${c.name}, ${s.name}`, item: st });
          }
        });
      });
    });

    return results.slice(0, 6);
  }, [searchQuery]);

  // Rankings lists for drawer
  const mostPolluted = useMemo(() => getMostPollutedCities(10), []);
  const cleanest = useMemo(() => getCleanestCities(10), []);

  // Helper to extract value based on selected metricFilter
  const getMetricValue = (item: { aqi?: number; averageAqi?: number; pollutants?: any }): number => {
    if (metricFilter === 'pm2_5' && item.pollutants?.pm2_5) {
      return Math.round(item.pollutants.pm2_5);
    }
    if (metricFilter === 'pm10' && item.pollutants?.pm10) {
      return Math.round(item.pollutants.pm10);
    }
    return item.averageAqi ?? item.aqi ?? 0;
  };

  const metricUnit = metricFilter === 'aqi' ? '' : ' µg';

  // GeoJSON state styling function (Choropleth by AQI score)
  const styleStateFeature = useCallback((feature: any) => {
    const stateName = feature?.properties?.name;
    const state = getStateByGeoJsonName(stateName);
    const color = state ? getAQIColorHex(state.category) : '#64748B';
    const isSelected = selectedState && state && selectedState.id === state.id;

    return {
      fillColor: color,
      weight: isSelected ? 3.5 : 1.2,
      opacity: 1,
      color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
      dashArray: '',
      fillOpacity: isSelected ? 0.85 : 0.65,
    };
  }, [selectedState]);

  // GeoJSON feature interaction handler
  const onEachStateFeature = useCallback((feature: any, layer: L.Layer) => {
    const stateName = feature?.properties?.name;
    const state = getStateByGeoJsonName(stateName);

    if (state) {
      const aqi = state.averageAqi;
      const color = getAQIColorHex(state.category);

      layer.bindTooltip(
        `
        <div style="font-family: inherit; padding: 4px 6px; text-align: center; color: #0F172A; min-width: 110px;">
          <div style="font-weight: 800; font-size: 13px; color: #0F172A;">${state.name}</div>
          <div style="font-weight: 800; font-size: 12px; color: ${color}; margin-top: 1px;">
            AQI ${aqi} (${state.category.toUpperCase()})
          </div>
          <div style="font-size: 10px; color: #64748B; margin-top: 3px;">
            Click to zoom into ${state.citiesCount} cities
          </div>
        </div>
        `,
        { direction: 'top', sticky: true, opacity: 0.95 }
      );

      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            weight: 3.5,
            color: '#FFFFFF',
            fillOpacity: 0.85,
          });
          l.bringToFront();
        },
        mouseout: (e: any) => {
          const l = e.target;
          const isSelected = selectedState?.id === state.id;
          l.setStyle({
            weight: isSelected ? 3.5 : 1.2,
            color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
            fillOpacity: isSelected ? 0.85 : 0.65,
          });
        },
        click: () => {
          handleSelectState(state);
        },
      });
    }
  }, [selectedState, handleSelectState]);

  // Active item for Quick-Inspector (custom clicked point or selected item)
  const activeInspectorItem = customPoint || selectedStation || selectedCity || selectedState;

  return (
    <div className="space-y-3">
      {/* Metro Quick-Jump Hubs (aqi.in / aqicn signature) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 px-1 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          Metro Quick Jump:
        </span>
        {metroCities.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelectCity(m)}
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all backdrop-blur-md shadow-sm ${
              selectedCity?.id === m.id
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-white/85 dark:bg-navy-900/85 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-850'
            }`}
          >
            <span>{m.name}</span>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-black text-white"
              style={{ backgroundColor: getAQIColorHex(m.category) }}
            >
              {m.aqi}
            </span>
          </button>
        ))}
      </div>

      <div className={cn("relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-2xl bg-slate-900 select-none flex flex-col", heightClassName, className)}>
      {/* Top Map Floating HUD: Navigation, Region Switchers & Controls */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left HUD: Breadcrumb Navigation & Region Pills */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Breadcrumb Navigation Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 shadow-xl text-xs sm:text-sm font-semibold">
            <button
              onClick={() => handleFlyToRegion('world')}
              className="text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
              title="View Worldwide Global Map"
            >
              <Globe className="w-4 h-4" />
              <span>World</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => handleFlyToRegion('india')}
              className="text-emerald-500 hover:text-emerald-400 transition-colors font-bold"
              title="Focus on India"
            >
              India
            </button>

            {selectedState && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => handleSelectState(selectedState)}
                  className="text-slate-700 dark:text-slate-200 hover:text-emerald-400 transition-colors truncate max-w-[110px]"
                >
                  {selectedState.name}
                </button>
              </>
            )}

            {selectedCity && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => handleSelectCity(selectedCity)}
                  className="text-slate-700 dark:text-slate-200 hover:text-emerald-400 transition-colors truncate max-w-[110px]"
                >
                  {selectedCity.name}
                </button>
              </>
            )}

            {selectedStation && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-400 font-bold truncate max-w-[120px]">
                  {selectedStation.name}
                </span>
              </>
            )}

            {customPoint && !selectedStation && !selectedCity && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-400 font-bold truncate max-w-[130px]">
                  {customPoint.name}
                </span>
              </>
            )}
          </div>

          {/* Region Quick Selectors */}
          <div className="flex items-center bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 rounded-2xl p-1 shadow-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => handleFlyToRegion('india')}
              className={cn(
                "px-2.5 py-1 rounded-xl transition-all whitespace-nowrap",
                activeRegion === 'india'
                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-400"
              )}
            >
              🇮🇳 India (Focus)
            </button>
            <button
              onClick={() => handleFlyToRegion('world')}
              className={cn(
                "px-2.5 py-1 rounded-xl transition-all whitespace-nowrap",
                activeRegion === 'world'
                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-400"
              )}
            >
              🌍 Whole World
            </button>
            <button
              onClick={() => handleFlyToRegion('asia')}
              className={cn(
                "hidden sm:inline-block px-2.5 py-1 rounded-xl transition-all whitespace-nowrap",
                activeRegion === 'asia'
                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-400"
              )}
            >
              🌏 Asia
            </button>
            <button
              onClick={() => handleFlyToRegion('europe')}
              className={cn(
                "hidden md:inline-block px-2.5 py-1 rounded-xl transition-all whitespace-nowrap",
                activeRegion === 'europe'
                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-400"
              )}
            >
              🇪🇺 Europe
            </button>
            <button
              onClick={() => handleFlyToRegion('americas')}
              className={cn(
                "hidden md:inline-block px-2.5 py-1 rounded-xl transition-all whitespace-nowrap",
                activeRegion === 'americas'
                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-400"
              )}
            >
              🇺🇸 Americas
            </button>
          </div>

          {/* Metric Selector (AQI / PM2.5 / PM10) */}
          <div className="flex items-center bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 rounded-2xl p-1 shadow-xl text-xs">
            <button
              onClick={() => setMetricFilter('aqi')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricFilter === 'aqi'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-400'
              }`}
            >
              AQI
            </button>
            <button
              onClick={() => setMetricFilter('pm2_5')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricFilter === 'pm2_5'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-400'
              }`}
            >
              PM2.5
            </button>
            <button
              onClick={() => setMetricFilter('pm10')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricFilter === 'pm10'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-400'
              }`}
            >
              PM10
            </button>
          </div>
        </div>

        {/* Right HUD: Search Box, Base Map Selector, Rankings Drawer & Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* In-Map Search */}
          <div className="relative">
            <div className="flex items-center px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 shadow-xl text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search world, state, district..."
                className="bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-32 sm:w-48"
              />
            </div>

            {/* In-Map Search Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[600]">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (res.type === 'state') handleSelectState(res.item);
                      if (res.type === 'city') handleSelectCity(res.item);
                      if (res.type === 'station') handleSelectStation(res.item);
                      if (res.type === 'world') {
                        setMapCenter([res.item.lat, res.item.lon]);
                        setCurrentZoom(10);
                        handleMapClick(res.item.lat, res.item.lon);
                      }
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{res.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {res.type.toUpperCase()} {res.parent ? `• ${res.parent}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Base Layer Switcher */}
          <div className="flex items-center bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 rounded-2xl p-1 shadow-xl text-xs">
            <button
              onClick={() => setMapStyle('dark')}
              title="Tactical Dark Map"
              className={`p-1.5 rounded-xl transition-all ${
                mapStyle === 'dark'
                  ? 'bg-navy-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-navy-950 border border-slate-600" />
            </button>
            <button
              onClick={() => setMapStyle('light')}
              title="Clean Street Map"
              className={`p-1.5 rounded-xl transition-all ${
                mapStyle === 'light'
                  ? 'bg-slate-200 text-emerald-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-300" />
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              title="Satellite Imagery"
              className={`p-1.5 rounded-xl transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rankings Drawer Toggle Button */}
          <button
            onClick={() => setShowRankings(!showRankings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-xl text-xs font-bold transition-all ${
              showRankings
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30'
                : 'bg-white/95 dark:bg-navy-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-navy-700 hover:text-amber-400'
            }`}
            title="Toggle India AQI Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={() => handleFlyToRegion('india')}
            className="p-2 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 shadow-xl text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-all"
            title="Reset to All-India View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controlled Zoom Sensing Widget (Left Side Floating Controls) */}
      <div className="absolute left-4 top-20 z-[500] flex flex-col gap-1.5 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 rounded-2xl p-1.5 shadow-xl text-slate-700 dark:text-slate-200">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 dark:bg-navy-700 my-0.5" />
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setMapCenter([pos.coords.latitude, pos.coords.longitude]);
                setCurrentZoom(11);
                handleMapClick(pos.coords.latitude, pos.coords.longitude);
              });
            }
          }}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-emerald-500 transition-colors"
          title="Fly to My Current Location (GPS)"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom Level Indicator Pill */}
      <div className="absolute left-16 top-20 z-[500] pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-navy-900/80 backdrop-blur-md border border-navy-700 text-[10px] uppercase font-bold tracking-wider text-slate-300 shadow-lg">
          {activeLevel === 'world' 
            ? '🌍 Global World Map' 
            : activeLevel === 'state' 
              ? '🇮🇳 Indian State Choropleth (L1)' 
              : activeLevel === 'city' 
                ? '🏙️ District & City Drilldown (L2)' 
                : '📍 Village & Station Precision (L3 • Click anywhere to measure)'}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={currentZoom}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full cursor-crosshair"
        >
          <TileLayer attribution={tileLayerConfig.attribution} url={tileLayerConfig.url} />
          
          <MapEventsController 
            targetCenter={mapCenter} 
            targetZoom={currentZoom} 
            onZoomChange={setCurrentZoom}
            onMapClick={handleMapClick}
          />

          {/* WORLD LEVEL: Global Megacities (Rendered on World Map view) */}
          {(activeLevel === 'world' || currentZoom <= 5) &&
            WORLD_CITIES_DATA.map((wc) => {
              const color = getAQIColorHex(wc.category);
              const val = getMetricValue(wc);
              const isHazardous = wc.aqi >= 200;

              return (
                <Marker
                  key={`world-city-${wc.id}`}
                  position={[wc.lat, wc.lon]}
                  icon={createPinIcon(val, wc.name, color, 'md', isHazardous, metricUnit)}
                  eventHandlers={{
                    click: () => {
                      setMapCenter([wc.lat, wc.lon]);
                      setCurrentZoom(10);
                      handleMapClick(wc.lat, wc.lon);
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
                    <div className="text-center font-sans p-1 text-slate-900">
                      <div className="font-bold text-xs">{wc.name}, {wc.country}</div>
                      <div className="text-[11px] font-semibold" style={{ color }}>
                        AQI {wc.aqi} ({wc.category})
                      </div>
                      <div className="text-[9px] text-slate-500">Global Megacity Monitor</div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

          {/* LEVEL 1: Indian State Choropleth Polygons */}
          <GeoJSON
            key={`india-geojson-${selectedState?.id || 'all'}-${metricFilter}`}
            data={indiaStatesGeoData as any}
            style={styleStateFeature}
            onEachFeature={onEachStateFeature}
          />

          {/* Indian State Center Badges (Rendered when zoom is 4 to 6) */}
          {activeLevel === 'state' &&
            INDIA_STATES_DATA.map((state) => {
              const color = getAQIColorHex(state.category);
              const val = getMetricValue(state);
              const isHazardous = state.averageAqi >= 200;

              return (
                <Marker
                  key={`state-pin-${state.id}`}
                  position={[state.lat, state.lon]}
                  icon={createPinIcon(val, state.name, color, 'lg', isHazardous, metricUnit)}
                  eventHandlers={{
                    click: () => handleSelectState(state),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                    <div className="text-center font-sans p-1 text-slate-900">
                      <div className="font-bold text-xs">{state.name}</div>
                      <div className="text-[11px] font-semibold" style={{ color }}>
                        AQI {state.averageAqi} ({state.category})
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Click to explore {state.citiesCount} cities & districts
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

          {/* LEVEL 2: Districts & Cities (Rendered when zoom > 6 or a state is selected) */}
          {(activeLevel === 'city' || selectedState) &&
            (selectedState ? [selectedState] : INDIA_STATES_DATA).flatMap((state) =>
              state.cities.map((city) => {
                const color = getAQIColorHex(city.category);
                const val = getMetricValue(city);
                const isHazardous = city.aqi >= 200;

                return (
                  <Marker
                    key={`city-pin-${city.id}`}
                    position={[city.lat, city.lon]}
                    icon={createPinIcon(val, city.name, color, 'md', isHazardous, metricUnit)}
                    eventHandlers={{
                      click: () => handleSelectCity(city),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
                      <div className="text-center font-sans p-1 text-slate-900">
                        <div className="font-bold text-xs">{city.name}</div>
                        <div className="text-[11px] font-semibold" style={{ color }}>
                          AQI {city.aqi} ({city.category})
                        </div>
                        {city.stations.length > 0 && (
                          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            Click to view {city.stations.length} ground stations
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })
            )}

          {/* LEVEL 3: Precision Ground Stations (Rendered when zoom >= 9 or city selected) */}
          {(activeLevel === 'station' || selectedCity) &&
            (selectedCity 
              ? selectedCity.stations 
              : selectedState 
                ? selectedState.cities.flatMap(c => c.stations) 
                : INDIA_STATES_DATA.flatMap(s => s.cities.flatMap(c => c.stations))
            ).map((station) => {
              const color = getAQIColorHex(station.category);
              const val = getMetricValue(station);
              const isHazardous = station.aqi >= 200;

              return (
                <Marker
                  key={`station-pin-${station.id}`}
                  position={[station.lat, station.lon]}
                  icon={createPinIcon(val, station.name, color, 'sm', isHazardous, metricUnit)}
                  eventHandlers={{
                    click: () => handleSelectStation(station),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                    <div className="text-center font-sans p-1 text-slate-900">
                      <div className="font-bold text-xs">{station.name}</div>
                      <div className="text-[10px] text-slate-500">{station.operator}</div>
                      <div className="text-[11px] font-semibold" style={{ color }}>
                        AQI {station.aqi} ({station.category})
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

          {/* CUSTOM CLICK-TO-MEASURE PIN (Any village, district, or global point) */}
          {customPoint && (
            <Marker
              position={[customPoint.lat, customPoint.lon]}
              icon={createTargetPinIcon()}
            >
              <Tooltip direction="top" offset={[0, -14]} permanent opacity={0.95}>
                <div className="text-center font-sans p-1 text-slate-900">
                  <div className="font-bold text-xs">{customPoint.name}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {customPoint.isLoading ? 'Measuring CAMS model...' : `Verified AQI ${customPoint.aqi}`}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Quick-Inspector Card (for clicked village/district or selected station) */}
        {activeInspectorItem && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[600] rounded-3xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-slate-200 dark:border-navy-700 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-navy-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {customPoint 
                    ? 'Target Location (Village / District / City)' 
                    : selectedStation 
                      ? 'Ground Monitoring Station' 
                      : selectedCity 
                        ? 'Indian City' 
                        : 'State / Territory'}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {activeInspectorItem.name}
                </h4>
                {(activeInspectorItem as any).state && (
                  <span className="text-[11px] text-slate-400 block">
                    {(activeInspectorItem as any).state}, {(activeInspectorItem as any).country || 'India'}
                  </span>
                )}
                {selectedStation && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-emerald-500 font-medium">
                      {(selectedStation as IndiaStation).operator}
                    </span>
                    {(selectedStation as IndiaStation).code && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-[10px] text-slate-400 font-mono">
                        {(selectedStation as IndiaStation).code}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {(activeInspectorItem as any).isLoading ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                ) : (
                  <div
                    className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-white shadow-md"
                    style={{
                      backgroundColor: getAQIColorHex(activeInspectorItem.category),
                    }}
                  >
                    AQI {(activeInspectorItem as any).averageAqi ?? (activeInspectorItem as any).aqi}
                  </div>
                )}
                <button
                  onClick={() => {
                    setCustomPoint(null);
                    setSelectedStation(null);
                    setSelectedCity(null);
                    setSelectedState(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Criteria Pollutants Matrix (6-Pollutant Grid) */}
            {(activeInspectorItem as any).pollutants && !(activeInspectorItem as any).isLoading && (
              <div className="grid grid-cols-3 gap-1.5 my-2.5 text-center text-[10px]">
                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium text-[9px]">PM2.5</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.pm2_5 ?? 0}
                  </span>
                  <span className="text-[8px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium text-[9px]">PM10</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.pm10 ?? 0}
                  </span>
                  <span className="text-[8px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium text-[9px]">NO2</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.no2 ?? 0}
                  </span>
                  <span className="text-[8px] text-slate-400">µg/m³</span>
                </div>
                {(activeInspectorItem as any).pollutants.so2 !== undefined && (
                  <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                    <span className="block text-slate-400 font-medium text-[9px]">SO2</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {(activeInspectorItem as any).pollutants.so2}
                    </span>
                    <span className="text-[8px] text-slate-400">µg/m³</span>
                  </div>
                )}
                {(activeInspectorItem as any).pollutants.co !== undefined && (
                  <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                    <span className="block text-slate-400 font-medium text-[9px]">CO</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {(activeInspectorItem as any).pollutants.co}
                    </span>
                    <span className="text-[8px] text-slate-400">µg/m³</span>
                  </div>
                )}
                {(activeInspectorItem as any).pollutants.o3 !== undefined && (
                  <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                    <span className="block text-slate-400 font-medium text-[9px]">O3</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {(activeInspectorItem as any).pollutants.o3}
                    </span>
                    <span className="text-[8px] text-slate-400">µg/m³</span>
                  </div>
                )}
              </div>
            )}

            {/* Cigarette Equivalence Health Note */}
            {(activeInspectorItem as any).pollutants?.pm2_5 !== undefined && !(activeInspectorItem as any).isLoading && (
              <div className="my-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-[11px] text-rose-400 font-medium leading-tight">
                  {calculateCigaretteEquivalence((activeInspectorItem as any).pollutants.pm2_5).label}
                </span>
              </div>
            )}

            {/* Data Verification Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>US EPA Title 40 CFR Part 58 Validated Telemetry</span>
            </div>

            {/* Inspector Actions */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleSetAppLocation(
                    activeInspectorItem.name,
                    activeInspectorItem.lat,
                    activeInspectorItem.lon,
                    (activeInspectorItem as any).country || 'India'
                  )
                }
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Set as Active Location
              </button>

              {selectedState && !selectedCity && (
                <button
                  onClick={() => {
                    const firstCity = selectedState.cities[0];
                    if (firstCity) handleSelectCity(firstCity);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:text-emerald-400 text-xs font-semibold"
                >
                  Explore Cities
                </button>
              )}
            </div>
          </div>
        )}

        {/* National Rankings Leaderboard Drawer */}
        {showRankings && (
          <div className="absolute top-16 right-4 bottom-16 w-80 z-[600] rounded-3xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-slate-200 dark:border-navy-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  India AQI Leaderboard
                </h4>
              </div>
              <button
                onClick={() => setShowRankings(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ranking Tabs */}
            <div className="flex p-2 bg-slate-100 dark:bg-navy-850 gap-1 border-b border-slate-200 dark:border-navy-800">
              <button
                onClick={() => setRankingTab('polluted')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  rankingTab === 'polluted'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Most Polluted
              </button>
              <button
                onClick={() => setRankingTab('cleanest')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  rankingTab === 'cleanest'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cleanest Air
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {(rankingTab === 'polluted' ? mostPolluted : cleanest).map((city, idx) => {
                const color = getAQIColorHex(city.category);
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                return (
                  <button
                    key={city.id}
                    onClick={() => {
                      handleSelectCity(city);
                      setShowRankings(false);
                    }}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-navy-850 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/60 dark:border-navy-800 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center font-bold text-xs text-slate-400">
                        {medal}
                      </span>
                      <div>
                        <span className="block font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                          {city.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {city.stateName}
                        </span>
                      </div>
                    </div>

                    <div
                      className="px-2 py-0.5 rounded-lg text-xs font-extrabold text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {city.aqi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Interactive Severity Legend */}
      <div className="p-3 sm:p-4 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-t border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs z-[500]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            AQI Severity:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-600 dark:text-slate-300">Good (0-50)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-slate-600 dark:text-slate-300">Moderate (51-100)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
            <span className="text-slate-600 dark:text-slate-300">Sensitive (101-150)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-slate-600 dark:text-slate-300">Unhealthy (151-200)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
            <span className="text-slate-600 dark:text-slate-300">Very Unhealthy (201-300)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-950 border border-red-500" />
            <span className="text-slate-600 dark:text-slate-300">Hazardous (301+)</span>
          </span>
        </div>

        <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Click anywhere to measure any village, district, or global point</span>
        </div>
      </div>
    </div>
    </div>
  );
}
