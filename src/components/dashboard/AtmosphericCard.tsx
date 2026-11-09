'use client';

import React from 'react';
import { Wind, Thermometer, Droplets, Compass } from 'lucide-react';

interface AtmosphericCardProps {
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
  };
}

export function AtmosphericCard({ weather }: AtmosphericCardProps) {
  const temp = weather?.temperature ?? 26.0;
  const humidity = weather?.humidity ?? 55;
  const windSpeed = weather?.windSpeed ?? 7.5;
  const windDir = weather?.windDirection ?? 135;

  // Dispersion index calculation based on wind and humidity
  let dispersionRating = 'Moderate Dispersion';
  let dispersionColor = 'text-amber-400';
  let dispersionDesc = 'Normal air mixing. Moderate accumulation of ground-level particles.';

  if (windSpeed < 5 && humidity > 70) {
    dispersionRating = 'Poor Dispersion (Stagnant Air)';
    dispersionColor = 'text-rose-400';
    dispersionDesc = 'High humidity & low wind trap particulates near ground level, worsening smog.';
  } else if (windSpeed > 15) {
    dispersionRating = 'Strong Ventilation';
    dispersionColor = 'text-emerald-400';
    dispersionDesc = 'Strong breeze helps ventilate and dilute local pollutant concentrations rapidly.';
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-md backdrop-blur-md p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Atmospheric Conditions
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Weather & Particulate Dispersion
            </span>
          </div>
        </div>

        <span className={`text-xs font-semibold ${dispersionColor}`}>
          {dispersionRating}
        </span>
      </div>

      {/* Grid of Weather Metrics */}
      <div className="grid grid-cols-3 gap-3 my-2">
        {/* Temperature */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-center">
          <Thermometer className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {temp.toFixed(1)}°C
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            Ambient Temp
          </span>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-center">
          <Droplets className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {humidity}%
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            Relative Humidity
          </span>
        </div>

        {/* Wind Speed */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-center">
          <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {windSpeed.toFixed(1)} <span className="text-xs">km/h</span>
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            Wind Speed
          </span>
        </div>
      </div>

      {/* Dispersion Insight Note */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-navy-850 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
        <span className="font-semibold text-slate-700 dark:text-slate-200">Atmospheric Impact: </span>
        {dispersionDesc}
      </p>
    </div>
  );
}
