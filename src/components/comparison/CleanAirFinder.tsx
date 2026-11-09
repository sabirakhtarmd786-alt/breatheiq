'use client';

import React, { useState, useMemo } from 'react';
import { useLocation } from '@/context/LocationContext';
import { INDIA_STATES_DATA } from '@/lib/data/indiaAirQualityData';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  ShieldCheck, 
  Wind, 
  Trees, 
  Sparkles, 
  ArrowRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Environmental factors explaining clean air zones
const CLEAN_AIR_RATIONALE: Record<string, string> = {
  'shimla': 'High-altitude Himalayan pine forest canopy with minimal vehicular density and rapid valley ventilation.',
  'dharamshala': 'Protected Dhauladhar mountain foothills with natural katabatic wind flushing.',
  'thiruvananthapuram': 'Continuous Arabian Sea coastal breezes providing constant marine aerosol dilution.',
  'kochi': 'Coastal marine boundary layer with steady onshore breeze.',
  'mangaluru': 'Coastal Western Ghats green belt with high precipitation washing out airborne particulates.',
  'panaji': 'Mandovi estuary coastal winds and strict regional emissions regulations.',
  'mysuru': 'Low industrial manufacturing density and extensive urban green cover.',
  'borivali': 'Sanjay Gandhi National Park protected deciduous forest zone with microclimate filtration.',
};

export function CleanAirFinder() {
  const { currentLocation, setCurrentLocation } = useLocation();
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(500);

  // Flatten all cities and stations in India and calculate distance
  const candidates = useMemo(() => {
    const list: {
      id: string;
      name: string;
      state: string;
      lat: number;
      lon: number;
      aqi: number;
      category: string;
      pm2_5: number;
      pm10: number;
      distanceKm: number;
      rationale: string;
      type: 'city' | 'station';
    }[] = [];

    INDIA_STATES_DATA.forEach((s) => {
      s.cities.forEach((c) => {
        const dist = calculateHaversineDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          c.lat,
          c.lon
        );

        const defaultRationale = c.aqi < 50
          ? 'Exceptional coastal or elevated vegetative buffer with natural particulate dispersion.'
          : c.aqi < 100
          ? 'Moderate urban ventilation and lower industrial combustion output compared to major hubs.'
          : 'Relative regional sanctuary compared to higher ambient industrial basins.';

        list.push({
          id: c.id,
          name: c.name,
          state: s.name,
          lat: c.lat,
          lon: c.lon,
          aqi: c.aqi,
          category: c.category,
          pm2_5: c.pollutants.pm2_5,
          pm10: c.pollutants.pm10,
          distanceKm: dist,
          rationale: CLEAN_AIR_RATIONALE[c.id.toLowerCase()] || defaultRationale,
          type: 'city',
        });
      });
    });

    // Filter by radius and sort by lowest AQI first (Cleanest first)
    return list
      .filter((item) => maxRadiusKm === 0 || item.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.aqi - b.aqi)
      .slice(0, 8);
  }, [currentLocation, maxRadiusKm]);

  const handleSelectCleanLocation = (item: any) => {
    setCurrentLocation({
      id: `${item.lat}_${item.lon}`,
      name: item.name,
      country: 'India',
      countryCode: 'IN',
      admin1: item.state,
      latitude: item.lat,
      longitude: item.lon,
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Clean Air Haven Finder
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Discovers and ranks regions with relatively cleaner measured air within proximity of {currentLocation.name}.
          </p>
        </div>

        {/* Radius Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-xs font-semibold">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
            Radius:
          </span>
          {[
            { label: '100 km', val: 100 },
            { label: '300 km', val: 300 },
            { label: '500 km', val: 500 },
            { label: 'All India', val: 0 },
          ].map((r) => (
            <button
              key={r.val}
              onClick={() => setMaxRadiusKm(r.val)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                maxRadiusKm === r.val
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates List */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((cand, idx) => {
            const color = getAQIColorHex(cand.category as any);
            const isRank1 = idx === 0;

            return (
              <Card
                key={cand.id}
                className={`p-5 transition-all relative overflow-hidden ${
                  isRank1 ? 'border-emerald-500/50 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5' : ''
                }`}
              >
                {isRank1 && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-sm">
                    #1 Cleanest Haven
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                        Rank #{idx + 1}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {cand.name}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                      {cand.state} • {cand.distanceKm === 0 ? 'Same Location' : `${cand.distanceKm} km away`}
                    </span>
                  </div>

                  {/* AQI Pill */}
                  <div 
                    className="px-3 py-1.5 rounded-xl text-center border shrink-0"
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: `${color}30`,
                      color,
                    }}
                  >
                    <span className="text-xl font-extrabold block leading-none">
                      {cand.aqi}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {cand.category}
                    </span>
                  </div>
                </div>

                {/* Pollutant Metrics */}
                <div className="flex items-center gap-4 py-2 border-y border-slate-100 dark:border-navy-800 text-xs my-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">PM2.5</span>
                    <strong className="text-slate-900 dark:text-white">{cand.pm2_5} µg/m³</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">PM10</span>
                    <strong className="text-slate-900 dark:text-white">{cand.pm10} µg/m³</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Proximity</span>
                    <strong className="text-emerald-400">{cand.distanceKm} km</strong>
                  </div>
                </div>

                {/* Explanation of Why It's Ranked Higher */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Why Cleaner: </span>
                  {cand.rationale}
                </p>

                {/* Switch to this location CTA */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectCleanLocation(cand)}
                  className="w-full text-xs gap-1.5 hover:border-emerald-500 hover:text-emerald-400"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View in Dashboard & Map
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-400">
            No monitoring zones found within {maxRadiusKm} km. Try selecting a broader search radius.
          </p>
        </Card>
      )}

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Health Advisory Notice:
        </div>
        <p className="leading-relaxed">
          Clean Air Finder identifies relatively lower measured concentrations based on official public sensor data. A lower index score does not guarantee absolute absence of allergens or hazardous micro-particulates for hyper-sensitive individuals.
        </p>
      </div>
    </div>
  );
}
