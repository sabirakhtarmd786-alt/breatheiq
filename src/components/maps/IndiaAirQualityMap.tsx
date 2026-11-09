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
  getStateByGeoJsonName,
  getMostPollutedCities,
  getCleanestCities,
  calculateCigaretteEquivalence
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
  ShieldCheck
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';

// Fix Leaflet default icon URLs for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Programmatic map fly-to controller
function MapController({ 
  targetCenter, 
  targetZoom, 
  onZoomChange 
}: { 
  targetCenter: [number, number]; 
  targetZoom: number; 
  onZoomChange: (z: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(targetCenter, targetZoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [targetCenter, targetZoom, map]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
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

export function IndiaAirQualityMap() {
  const { setCurrentLocation } = useLocation();
  const { theme } = useTheme();

  const [currentZoom, setCurrentZoom] = useState(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5937, 78.9629]); // Center of India
  const [selectedState, setSelectedState] = useState<IndiaState | null>(null);
  const [selectedCity, setSelectedCity] = useState<IndiaCity | null>(null);
  const [selectedStation, setSelectedStation] = useState<IndiaStation | null>(null);
  const [metricFilter, setMetricFilter] = useState<'aqi' | 'pm2_5' | 'pm10'>('aqi');
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRankings, setShowRankings] = useState(false);
  const [rankingTab, setRankingTab] = useState<'polluted' | 'cleanest'>('polluted');

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

  // Determine current active level based on zoom
  const activeLevel = useMemo(() => {
    if (currentZoom <= 6) return 'state';
    if (currentZoom <= 8.5) return 'city';
    return 'station';
  }, [currentZoom]);

  // Handle clicking a State
  const handleSelectState = useCallback((state: IndiaState) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedStation(null);
    setMapCenter([state.lat, state.lon]);
    setCurrentZoom(state.zoomLevel || 7.5);
  }, []);

  // Handle clicking a City
  const handleSelectCity = useCallback((city: IndiaCity) => {
    setSelectedCity(city);
    setSelectedStation(null);
    setMapCenter([city.lat, city.lon]);
    setCurrentZoom(11);
  }, []);

  // Handle clicking a Station
  const handleSelectStation = useCallback((station: IndiaStation) => {
    setSelectedStation(station);
    setMapCenter([station.lat, station.lon]);
    setCurrentZoom(13);
  }, []);

  // Reset to All-India view
  const handleResetIndia = () => {
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedStation(null);
    setMapCenter([22.5937, 78.9629]);
    setCurrentZoom(5);
    setSearchQuery('');
  };

  // Synchronize selection with main application location
  const handleSetAppLocation = (name: string, lat: number, lon: number) => {
    setCurrentLocation({
      id: `${lat}_${lon}`,
      name,
      country: 'India',
      countryCode: 'IN',
      latitude: lat,
      longitude: lon,
    });
  };

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const results: { type: 'state' | 'city' | 'station'; name: string; parent?: string; item: any }[] = [];

    // Search states
    INDIA_STATES_DATA.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
        results.push({ type: 'state', name: s.name, item: s });
      }
      // Search cities
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
            Click to explore ${state.citiesCount} cities
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

  // Active item for Quick-Inspector
  const activeInspectorItem = selectedStation || selectedCity || selectedState;

  return (
    <div className="relative w-full h-[680px] sm:h-[750px] rounded-3xl overflow-hidden border border-slate-200 dark:border-navy-800 shadow-2xl bg-slate-900 select-none flex flex-col">
      {/* Top Map Floating HUD: Breadcrumbs & Controls */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left HUD: Breadcrumb Navigation & Metric Pill */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Breadcrumb Navigation Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 shadow-xl text-xs sm:text-sm font-semibold">
            <button
              onClick={handleResetIndia}
              className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Compass className="w-4 h-4" />
              <span>India</span>
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

            {/* Precision Level Pill */}
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {activeLevel === 'state' ? 'State Choropleth (L1)' : activeLevel === 'city' ? 'City Drilldown (L2)' : 'Station Precision (L3)'}
            </span>
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
                placeholder="Search state, city..."
                className="bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-28 sm:w-40"
              />
            </div>

            {/* In-Map Search Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[600]">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (res.type === 'state') handleSelectState(res.item);
                      if (res.type === 'city') handleSelectCity(res.item);
                      if (res.type === 'station') handleSelectStation(res.item);
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
              title="Street Map"
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
            onClick={handleResetIndia}
            className="p-2 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-navy-700 shadow-xl text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-all"
            title="Reset to All-India View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={currentZoom}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer attribution={tileLayerConfig.attribution} url={tileLayerConfig.url} />
          
          <MapController 
            targetCenter={mapCenter} 
            targetZoom={currentZoom} 
            onZoomChange={setCurrentZoom} 
          />

          {/* LEVEL 1: Indian State Choropleth Polygons (Rendered across all India) */}
          <GeoJSON
            key={`india-geojson-${selectedState?.id || 'all'}-${metricFilter}`}
            data={indiaStatesGeoData as any}
            style={styleStateFeature}
            onEachFeature={onEachStateFeature}
          />

          {/* State Center Numbered Badges (Rendered when zoom <= 6) */}
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
                        Click to explore {state.citiesCount} cities
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

          {/* LEVEL 2: Cities (Rendered when zoom > 6 or a state is selected) */}
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
        </MapContainer>

        {/* Floating Quick-Inspector Card */}
        {activeInspectorItem && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[600] rounded-3xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-slate-200 dark:border-navy-700 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-navy-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {selectedStation ? 'Monitoring Station' : selectedCity ? 'Indian City' : 'State / UT'}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {activeInspectorItem.name}
                </h4>
                {selectedStation && (
                  <span className="text-[11px] text-emerald-500 font-medium">
                    {(selectedStation as IndiaStation).operator}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-white shadow-md"
                  style={{
                    backgroundColor: getAQIColorHex(activeInspectorItem.category),
                  }}
                >
                  AQI {(activeInspectorItem as any).averageAqi ?? (activeInspectorItem as any).aqi}
                </div>
                <button
                  onClick={() => {
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

            {/* Criteria Pollutants Matrix */}
            {(activeInspectorItem as any).pollutants && (
              <div className="grid grid-cols-3 gap-2 my-2.5 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium">PM2.5</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.pm2_5}
                  </span>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium">PM10</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.pm10}
                  </span>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
                  <span className="block text-slate-400 font-medium">NO2</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {(activeInspectorItem as any).pollutants.no2}
                  </span>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
              </div>
            )}

            {/* Cigarette Equivalence Health Note */}
            {(activeInspectorItem as any).pollutants?.pm2_5 && (
              <div className="my-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-[11px] text-rose-400 font-medium leading-tight">
                  {calculateCigaretteEquivalence((activeInspectorItem as any).pollutants.pm2_5).label}
                </span>
              </div>
            )}

            {/* Inspector Actions */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  handleSetAppLocation(
                    activeInspectorItem.name,
                    activeInspectorItem.lat,
                    activeInspectorItem.lon
                  )
                }
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Set as Active
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
            AQI Severity Legend:
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
          <span>Every state divided by live AQI color • Click any state to drill down</span>
        </div>
      </div>
    </div>
  );
}
