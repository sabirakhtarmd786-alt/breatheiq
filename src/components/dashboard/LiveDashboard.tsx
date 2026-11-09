'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '@/context/LocationContext';
import { AirQualityData, PollutantKey, AQICategory } from '@/types';
import { AQIGauge } from './AQIGauge';
import { PollutantCard } from './PollutantCard';
import { 
  RotateCw, 
  MapPin, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  Share2,
  Flame,
  Cigarette,
  Wind,
  Thermometer,
  Droplets,
  Compass,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  Activity,
  HeartPulse,
  Fan,
  ChevronRight,
  Globe,
  Maximize2
} from 'lucide-react';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import { IndiaCityBar } from '@/components/dashboard/IndiaCityBar';
import { AQISpectrumBar } from '@/components/dashboard/AQISpectrumBar';
import { PersonaActivityMatrix } from '@/components/dashboard/PersonaActivityMatrix';
import { PollutantModal } from '@/components/dashboard/PollutantModal';
import { MapWrapper } from '@/components/maps/MapWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { formatTimeAgo } from '@/lib/utils';
import { 
  getMostPollutedCities, 
  getCleanestCities, 
  calculateCigaretteEquivalence 
} from '@/lib/data/indiaAirQualityData';
import { getAQIColorHex } from '@/lib/aqi/calculator';

interface LiveDashboardProps {
  onNavigateToMap: () => void;
  onNavigateToHealth: () => void;
  onNavigateToAnalytics: () => void;
}

export function LiveDashboard({
  onNavigateToMap,
  onNavigateToHealth,
  onNavigateToAnalytics,
}: LiveDashboardProps) {
  const { currentLocation, setCurrentLocation } = useLocation();

  const [data, setData] = useState<AirQualityData & { weather?: any; hourlyData?: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [rankingsTab, setRankingsTab] = useState<'polluted' | 'cleanest'>('polluted');
  const [inspectPollutant, setInspectPollutant] = useState<PollutantKey | null>(null);

  const handleSelectCity = (city: { name: string; lat: number; lon: number; country?: string }) => {
    setCurrentLocation({
      id: `${city.lat}_${city.lon}`,
      name: city.name,
      country: city.country || 'India',
      countryCode: city.country === 'India' || !city.country ? 'IN' : undefined,
      latitude: city.lat,
      longitude: city.lon,
    });
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/air-quality?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&city=${encodeURIComponent(
          currentLocation.name
        )}&country=${encodeURIComponent(currentLocation.country || 'India')}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch environmental data (${res.status})`);
      }

      const json = await res.json();
      setData(json);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Error fetching live air quality:', err);
      setError(err.message || 'Unable to retrieve live environmental feeds.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentLocation]);

  // Rankings data
  const mostPollutedCities = useMemo(() => getMostPollutedCities(5), []);
  const cleanestCities = useMemo(() => getCleanestCities(5), []);

  // Berkeley Earth cigarette equivalence
  const cigaretteData = useMemo(() => {
    const pm25 = data?.pollutants?.pm2_5?.value ?? 0;
    return calculateCigaretteEquivalence(pm25);
  }, [data]);

  // 24-hr hourly forecast strip data
  const hourlyStrip = useMemo(() => {
    if (!data?.hourlyData || data.hourlyData.length === 0) return [];
    return data.hourlyData.slice(0, 24).map((pt) => {
      const date = new Date(pt.time);
      const hourStr = date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const aqiVal = Math.round(pt.aqi);
      
      let color = '#10B981';
      let catLabel = 'Good';
      if (aqiVal > 300) { color = '#7F1D1D'; catLabel = 'Hazardous'; }
      else if (aqiVal > 200) { color = '#8B5CF6'; catLabel = 'Very Unhealthy'; }
      else if (aqiVal > 150) { color = '#EF4444'; catLabel = 'Unhealthy'; }
      else if (aqiVal > 100) { color = '#F97316'; catLabel = 'Sensitive'; }
      else if (aqiVal > 50) { color = '#F59E0B'; catLabel = 'Moderate'; }

      return {
        time: hourStr,
        aqi: aqiVal,
        color,
        catLabel,
        pm2_5: Math.round(pt.pm2_5 ?? 0),
      };
    });
  }, [data]);

  // Loading skeleton
  if (isLoading && !data) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-28 rounded-3xl bg-slate-200 dark:bg-navy-900" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-96 rounded-3xl bg-slate-200 dark:bg-navy-900" />
          <div className="lg:col-span-6 space-y-6">
            <div className="h-44 rounded-3xl bg-slate-200 dark:bg-navy-900" />
            <div className="h-44 rounded-3xl bg-slate-200 dark:bg-navy-900" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-navy-900" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <Card className="p-8 text-center border-rose-500/30 bg-rose-500/5 my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Unable to Load Live Environmental Data
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          {error}
        </p>
        <Button onClick={() => fetchData(true)} variant="primary" className="gap-2 mx-auto">
          <RotateCw className="w-4 h-4" />
          Retry Connection
        </Button>
      </Card>
    );
  }

  if (!data) return null;

  const pollutantOrder: PollutantKey[] = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'];

  // Human severity headline (aqi.in style)
  const getSeverityHeadline = (category: AQICategory) => {
    switch (category) {
      case 'good':
        return {
          headline: `Air quality in ${currentLocation.name} is Clean & Healthy`,
          desc: 'Atmospheric conditions are pristine. Ideal for all outdoor sports, running, and natural ventilation.',
        };
      case 'moderate':
        return {
          headline: `Air quality in ${currentLocation.name} is Acceptable`,
          desc: 'Air quality is satisfactory for most people. Unusually sensitive individuals should monitor prolonged exertion.',
        };
      case 'sensitive':
        return {
          headline: `Air quality in ${currentLocation.name} is Unhealthy for Sensitive Groups`,
          desc: 'Children, the elderly, and individuals with asthma or respiratory conditions should limit heavy outdoor exertion.',
        };
      case 'unhealthy':
        return {
          headline: `Air quality in ${currentLocation.name} is Unhealthy`,
          desc: 'Everyone may begin to experience health effects. High particulate density — wear an airtight N95 respirator outside.',
        };
      case 'veryUnhealthy':
        return {
          headline: `HEALTH ALERT: Air in ${currentLocation.name} is Very Unhealthy`,
          desc: 'Significant risk of cardiac and pulmonary irritation for the entire population. Avoid all outdoor aerobic activities.',
        };
      case 'hazardous':
        return {
          headline: `EMERGENCY ALERT: Air in ${currentLocation.name} is Hazardous!`,
          desc: 'Critical health emergency. Toxic particulate saturation. Stay strictly indoors, seal windows, and run HEPA air purifiers.',
        };
      default: {
        const cat = String(category || '').toLowerCase();
        if (cat.includes('good')) {
          return {
            headline: `Air quality in ${currentLocation.name} is Clean & Healthy`,
            desc: 'Atmospheric conditions are pristine. Ideal for all outdoor sports, running, and natural ventilation.',
          };
        }
        if (cat.includes('moderate')) {
          return {
            headline: `Air quality in ${currentLocation.name} is Acceptable`,
            desc: 'Air quality is satisfactory for most people. Unusually sensitive individuals should monitor prolonged exertion.',
          };
        }
        if (cat.includes('hazard')) {
          return {
            headline: `EMERGENCY ALERT: Air in ${currentLocation.name} is Hazardous!`,
            desc: 'Critical health emergency. Toxic particulate saturation. Stay strictly indoors, seal windows, and run HEPA air purifiers.',
          };
        }
        return {
          headline: `Air quality in ${currentLocation.name} is ${data?.aqi.label || 'Monitored'}`,
          desc: 'Monitor real-time exposure and follow appropriate precautionary measures.',
        };
      }
    }
  };

  const severityHeadline = getSeverityHeadline(data.aqi.category);

  // 4 Actionable Health Icon details (aqi.in / aqicn style)
  const getActionableHealthCards = (category: AQICategory) => {
    const isClean = category === 'good' || category === 'moderate';
    const isMedium = category === 'sensitive';
    const isSevere = category === 'unhealthy' || category === 'veryUnhealthy' || category === 'hazardous';

    return [
      {
        icon: Activity,
        title: 'Outdoor Exercise',
        status: isClean ? 'Safe' : isMedium ? 'Caution' : 'Avoid Outdoors',
        statusColor: isClean ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        advice: isClean ? 'Great conditions for jogging and cycling.' : isMedium ? 'Reduce intense workouts; take regular rest breaks.' : 'Exercise indoors. Aerobic exertion increases deep lung particulate deposit.',
      },
      {
        icon: ShieldAlert,
        title: 'Face Mask',
        status: isClean ? 'Not Needed' : isMedium ? 'Advised Outdoors' : 'N95 Mandatory',
        statusColor: isClean ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        advice: isClean ? 'Normal breathing.' : isMedium ? 'Wear N95/KN95 if outside for prolonged periods.' : 'Certified N95/FFP2 respirator with airtight facial seal required.',
      },
      {
        icon: Wind,
        title: 'Windows & Airflow',
        status: isClean ? 'Open Windows' : isMedium ? 'Limit Ventilation' : 'Keep Sealed',
        statusColor: isClean ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        advice: isClean ? 'Bring fresh outdoor air into home spaces.' : isMedium ? 'Close windows during morning & evening pollution peaks.' : 'Seal windows and doors to prevent outdoor toxic smog infiltration.',
      },
      {
        icon: Fan,
        title: 'Air Purifier',
        status: isClean ? 'Not Needed' : isMedium ? 'Run Eco Mode' : 'Run Max HEPA',
        statusColor: isClean ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        advice: isClean ? 'Natural indoor air quality is safe.' : isMedium ? 'Operate air purifier in bedrooms during sleep.' : 'Run true-HEPA H13 purifiers continuously on maximum fan speed.',
      },
    ];
  };

  const actionableHealthCards = getActionableHealthCards(data.aqi.category);

  // 24-hr sparkline trend data for Recharts
  const trendData = (data.hourlyData || []).slice(0, 24).map((pt) => ({
    time: new Date(pt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    aqi: pt.aqi,
    pm2_5: pt.pm2_5,
    pm10: pt.pm10,
  }));

  return (
    <div className="space-y-6 select-none">
      {/* Global & India Quick-Jump City Switcher Strip */}
      <div className="p-3.5 rounded-3xl bg-white/85 dark:bg-navy-900/85 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <IndiaCityBar
          currentCityName={currentLocation.name}
          onSelectCity={handleSelectCity}
        />
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                {currentLocation.name}
              </h2>
              {currentLocation.country && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-navy-700">
                  {currentLocation.country}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-medium">Live Telemetry Refreshed {formatTimeAgo(lastRefreshedAt.toISOString())}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share AQI Card Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            className="text-xs gap-1.5 rounded-2xl"
            title="Generate shareable social summary card"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Card
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            isLoading={isRefreshing}
            className="text-xs gap-1.5 rounded-2xl"
            title="Fetch latest sensor feeds"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Jump to Map Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToMap}
            className="text-xs gap-1.5 rounded-2xl shadow-md shadow-emerald-500/25"
          >
            <Layers className="w-3.5 h-3.5" />
            Explore India Map
          </Button>
        </div>
      </div>

      {/* Hero Section: Live AQI Gauge + High-Impact Headline & Cigarette Equivalence (aqi.in style) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-xl backdrop-blur-xl p-6 sm:p-8">
        {/* Glowing Dynamic Ambient Aura */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: data.aqi.color }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Animated Circular AQI Gauge */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AQIGauge
              aqi={data.aqi}
              locationName={currentLocation.name}
              source={data.source}
              lastUpdated={formatTimeAgo(data.timestamp)}
            />
          </div>

          {/* Right: High-Impact Human Health Advisory & Cigarette Equivalence */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Live Severity Headline */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
                  style={{ backgroundColor: data.aqi.color }}
                >
                  {data.aqi.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Dominant: <strong className="text-slate-800 dark:text-slate-200 uppercase">{data.aqi.dominantPollutant.replace('_', '.')}</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {severityHeadline.headline}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {severityHeadline.desc}
              </p>
            </div>

            {/* Berkeley Earth Cigarette Equivalence Card (aqi.in benchmark) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/90 dark:bg-navy-850/90 border border-slate-200/80 dark:border-navy-750 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-500 shrink-0">
                  <Cigarette className="w-7 h-7" />
                  <span className="text-[9px] font-extrabold uppercase tracking-tighter">Equiv</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      ~{cigaretteData.cigarettes}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      cigarettes / day
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Breathing this ambient air for 24h equals inhaling smoke from ~{cigaretteData.cigarettes} cigarettes.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 sm:text-right shrink-0">
                <span className="block font-semibold text-slate-500 dark:text-slate-300">Berkeley Earth Formula</span>
                <span>1 cig ≈ 22 µg/m³ PM2.5</span>
              </div>
            </div>

            {/* Atmospheric Summary Pills */}
            {data.weather && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 text-center">
                  <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {data.weather.temperature?.toFixed(1)}°C
                  </span>
                  <span className="block text-[10px] text-slate-400">Temp</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 text-center">
                  <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {data.weather.humidity}%
                  </span>
                  <span className="block text-[10px] text-slate-400">Humidity</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/70 dark:border-navy-800 text-center">
                  <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {data.weather.windSpeed?.toFixed(1)} <span className="text-[10px]">km/h</span>
                  </span>
                  <span className="block text-[10px] text-slate-400">Wind</span>
                </div>
              </div>
            )}

            {/* aqi.in / aqicn 0-500 Color Spectrum Needle Slider */}
            <div className="pt-1">
              <AQISpectrumBar
                aqi={data.aqi.value}
                categoryLabel={data.aqi.label}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Global Air Quality Map (Mainly Focused on India) */}
      <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-xl backdrop-blur-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Live Air Quality Map
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Focused on India
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live CPCB / CAAQMS ground telemetry across Indian states & cities. Zoom out to explore the whole world in real time, or click any location on earth to measure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToMap}
              className="text-xs gap-1.5 rounded-2xl"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full Screen Map
            </Button>
          </div>
        </div>

        {/* Embedded Interactive Dynamic Map */}
        <MapWrapper heightClassName="h-[460px] sm:h-[540px] lg:h-[600px]" />
      </div>

      {/* Row 2: 4 Actionable Health Icon Cards (aqi.in / aqicn signature) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionableHealthCards.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white/90 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 shadow-md backdrop-blur-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${act.statusColor}`}>
                  {act.status}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {act.advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persona Activity Advisory Matrix */}
      <PersonaActivityMatrix
        aqiValue={data.aqi.value}
        aqiCategory={data.aqi.category}
      />

      {/* Row 3: 24-Hour Hour-by-Hour Timeline Forecast Strip (aqi.in benchmark) */}
      {hourlyStrip.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="w-5 h-5 text-emerald-400" />
                24-Hour Hourly Forecast Timeline
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hour-by-hour projected air quality trajectory and pollution peak windows.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Cleanest hours highlighted in green</span>
            </div>
          </div>

          {/* Horizontal Scrolling Hourly Bar Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {hourlyStrip.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-center flex flex-col items-center justify-between gap-2 hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {item.time}
                </span>

                {/* Vertical colored bar */}
                <div className="w-3.5 h-12 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    className="w-full rounded-full transition-all"
                    style={{
                      height: `${Math.min(100, (item.aqi / 300) * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <div className="text-center">
                  <span
                    className="block text-xs font-black"
                    style={{ color: item.color }}
                  >
                    {item.aqi}
                  </span>
                  <span className="block text-[9px] text-slate-400 truncate max-w-[65px]">
                    {item.pm2_5} µg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 4: Criteria Pollutants Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              6 Key Criteria Pollutants Real-Time Levels
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated against official US EPA Part 58 breakpoints and WHO guidelines.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            6 Active Sensors
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutantOrder.map((key) => {
            const pollutant = data.pollutants[key];
            if (!pollutant) return null;
            return (
              <PollutantCard
                key={key}
                pollutant={pollutant}
                onInspect={() => setInspectPollutant(key)}
              />
            );
          })}
        </div>
      </div>

      {/* Row 5: National Rankings Leaderboard & Advanced Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live National Rankings Widget (aqi.in benchmark) */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <CardTitle className="text-base sm:text-lg">
                    India AQI Rankings
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToMap}
                  className="text-xs text-emerald-500 hover:text-emerald-400 p-0 h-auto gap-1"
                >
                  View Map
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Tab Selector */}
              <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-850 mb-3 border border-slate-200 dark:border-navy-800">
                <button
                  onClick={() => setRankingsTab('polluted')}
                  className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    rankingsTab === 'polluted'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Most Polluted
                </button>
                <button
                  onClick={() => setRankingsTab('cleanest')}
                  className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    rankingsTab === 'cleanest'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cleanest Air
                </button>
              </div>

              {/* Cities List */}
              <div className="space-y-2">
                {(rankingsTab === 'polluted' ? mostPollutedCities : cleanestCities).map((c, i) => {
                  const color = getAQIColorHex(c.category);
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setCurrentLocation({
                          id: `${c.lat}_${c.lon}`,
                          name: c.name,
                          country: 'India',
                          countryCode: 'IN',
                          latitude: c.lat,
                          longitude: c.lon,
                        })
                      }
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-navy-850 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/70 dark:border-navy-800 transition-all flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center font-bold text-xs text-slate-400">
                          {medal}
                        </span>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {c.stateName}
                          </span>
                        </div>
                      </div>

                      <div
                        className="px-2 py-0.5 rounded-lg text-xs font-black text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {c.aqi}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Click any city above to switch active live telemetry.
            </p>
          </Card>
        </div>

        {/* Right: 24-Hour Diurnal Trajectory Chart */}
        <div className="lg:col-span-8 flex flex-col">
          {trendData.length > 0 && (
            <Card className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    24-Hour Diurnal Air Quality Trajectory
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Continuous model & sensor measurements illustrating rush-hour and nighttime thermal inversions.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToAnalytics}
                  className="text-xs text-emerald-500 hover:text-emerald-400 p-0 h-auto gap-1 self-start sm:self-auto"
                >
                  Deep Analytics
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={data.aqi.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={data.aqi.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      domain={[0, 'auto']} 
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="p-3 rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl text-xs space-y-1">
                              <span className="text-slate-400 font-semibold block">{item.time}</span>
                              <span className="font-bold text-white text-sm">AQI: {item.aqi}</span>
                              <div className="text-[11px] text-slate-400">
                                PM2.5: {item.pm2_5} µg/m³ • PM10: {item.pm10} µg/m³
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#F59E0B', fontSize: 10 }} />
                    <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy', fill: '#EF4444', fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="aqi"
                      stroke={data.aqi.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#trendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Share Card Modal */}
      <ShareCardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        aqiValue={data.aqi.value}
        aqiCategory={data.aqi.label}
        categoryColor={data.aqi.color}
        pm25Value={data.pollutants.pm2_5?.value ?? 0}
        dominantPollutant={data.aqi.dominantPollutant.toUpperCase().replace('_', '.')}
      />

      {/* Deep Dive Criteria Pollutant Modal */}
      {inspectPollutant && (
        <PollutantModal
          pollutant={inspectPollutant}
          measurement={
            data.pollutants[inspectPollutant]
              ? {
                  value: data.pollutants[inspectPollutant].value,
                  unit: data.pollutants[inspectPollutant].unit,
                  aqi: data.pollutants[inspectPollutant].aqiValue,
                  category: data.pollutants[inspectPollutant].category,
                }
              : undefined
          }
          onClose={() => setInspectPollutant(null)}
        />
      )}
    </div>
  );
}
