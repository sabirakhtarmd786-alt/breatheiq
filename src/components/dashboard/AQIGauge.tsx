'use client';

import React from 'react';
import { AQIResult } from '@/types';
import { ShieldCheck, Info, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AQIGaugeProps {
  aqi: AQIResult | any;
  locationName?: string;
  source?: string;
  lastUpdated?: string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export function AQIGauge({
  aqi,
  locationName = 'Current Location',
  source = 'Real-time Sensor',
  lastUpdated = 'Just now',
  size = 'md',
}: AQIGaugeProps) {
  // SVG gauge calculations (semi-circle 180 degrees)
  const radius = 90;
  const circumference = Math.PI * radius; // half circle circumference
  const aqiVal = typeof aqi === 'number' ? aqi : (aqi?.value ?? 0);
  const normalizedValue = Math.min(500, Math.max(0, aqiVal));
  const progressPercent = normalizedValue / 500;
  const strokeDashoffset = circumference - progressPercent * circumference;
  const aqiColor = aqi?.color || (aqiVal <= 50 ? '#10B981' : aqiVal <= 100 ? '#F59E0B' : aqiVal <= 200 ? '#EF4444' : '#881337');
  const aqiLabel = aqi?.label || (typeof aqi?.category === 'string' ? aqi.category : 'Current Air Quality');
  const dominant = (aqi?.dominantPollutant || 'pm2_5').toUpperCase().replace('_', '.');

  if (size === 'sm') {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative flex flex-col items-center justify-center">
          <svg viewBox="0 0 220 130" className="w-32 max-w-full overflow-visible drop-shadow">
            <path
              d="M 20 110 A 90 90 0 0 1 200 110"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              className="text-slate-200 dark:text-navy-800"
            />
            <path
              d="M 20 110 A 90 90 0 0 1 200 110"
              fill="none"
              stroke={aqiColor}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute top-10 flex flex-col items-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: aqiColor }}>
              {aqiVal}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              AQI
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-xl dark:shadow-black/30 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between transition-all">
      {/* Ambient background glow matching AQI color */}
      <div 
        className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: aqiColor }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: aqiColor }}
              />
              <span 
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: aqiColor }}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Environmental Index
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {locationName}
          </h2>
        </div>

        {/* Standard Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>US EPA Standard</span>
        </div>
      </div>

      {/* Center Gauge Arc */}
      <div className="relative flex flex-col items-center justify-center my-2 sm:my-4 z-10">
        <svg
          viewBox="0 0 220 130"
          className="w-56 sm:w-64 max-w-full overflow-visible drop-shadow-md"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="75%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className="text-slate-200 dark:text-navy-800"
          />

          {/* Active Animated Progress Arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            filter="url(#glow)"
          />
        </svg>

        {/* Center AQI Numeric Display */}
        <div className="absolute top-16 sm:top-18 flex flex-col items-center">
          <span 
            className="text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors duration-500"
            style={{ color: aqiColor }}
          >
            {aqiVal}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            US AQI
          </span>
        </div>

        {/* Category Pill */}
        <div 
          className="mt-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md border flex items-center gap-2 transition-all"
          style={{ 
            backgroundColor: `${aqiColor}20`,
            borderColor: `${aqiColor}50`,
            color: aqiColor
          }}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{aqiLabel}</span>
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Dominant Pollutant:
          </span>
          <span 
            className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-slate-100 dark:bg-navy-800 text-emerald-400 border border-slate-200 dark:border-navy-700"
          >
            {dominant}
          </span>
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate" title={source}>{source}</span>
          <span className="text-slate-400">• {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
