'use client';

import React, { useState } from 'react';
import { PollutantMeasurement } from '@/types';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollutantCardProps {
  pollutant: PollutantMeasurement;
  onInspect?: () => void;
}

export function PollutantCard({ pollutant, onInspect }: PollutantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorHex = getAQIColorHex(pollutant.category);

  // WHO threshold ratio
  const ratioToWho = (pollutant.value / (pollutant.whoThreshold || 1)).toFixed(1);
  const isOverWho = pollutant.value > pollutant.whoThreshold;

  // Percentage of EPA threshold standard capped at 100 for visual bar
  const epaPercent = Math.min(100, Math.round((pollutant.value / (pollutant.epaThreshold || 1)) * 100));

  return (
    <div 
      className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900/90 backdrop-blur-md p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
      style={{
        borderTop: `3px solid ${colorHex}`,
        boxShadow: `0 4px 20px -2px ${colorHex}15`,
      }}
    >
      {/* Subtle Ambient Glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
        style={{ backgroundColor: colorHex }}
      />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm tracking-tight border shadow-sm transition-transform group-hover:scale-105"
              style={{
                backgroundColor: `${colorHex}20`,
                borderColor: `${colorHex}50`,
                color: colorHex,
              }}
            >
              {pollutant.chemicalFormula}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {pollutant.name}
              </h4>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Atmospheric Criteria
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect();
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 border border-slate-200 dark:border-navy-700 transition-colors flex items-center gap-1"
                title="Deep WHO/EPA standards & health analysis"
              >
                <span>Deep Dive</span>
              </button>
            )}

            {/* Sub-index AQI Pill */}
            <div 
              className="px-2.5 py-1 rounded-xl text-xs font-black border shadow-sm"
              style={{
                backgroundColor: `${colorHex}20`,
                borderColor: `${colorHex}45`,
                color: colorHex,
              }}
            >
              AQI {pollutant.aqiValue}
            </div>
          </div>
        </div>

        {/* Big Concentration Value */}
        <div className="flex items-baseline gap-2 my-2.5">
          <span 
            className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            {pollutant.value}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {pollutant.unit}
          </span>
        </div>

        {/* EPA Standard Comparison Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">EPA Standard Ratio</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {epaPercent}% of Limit
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-navy-700/50">
            <div
              className="h-full rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${epaPercent}%`,
                backgroundColor: colorHex,
              }}
            />
          </div>
        </div>

        {/* WHO Guideline Chip */}
        <div className="mt-3 flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-850/80 border border-slate-200/70 dark:border-navy-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">WHO 24h Guideline:</span>
          <span className={cn(
            'font-bold',
            isOverWho ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
          )}>
            {pollutant.whoThreshold} {pollutant.unit} ({ratioToWho}×)
          </span>
        </div>
      </div>

      {/* Expandable Explanation Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 relative z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
        >
          <span className="font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            {isExpanded ? 'Hide Health Details' : 'What is this pollutant?'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 animate-fadeIn">
            <p className="leading-relaxed bg-slate-50 dark:bg-navy-850 p-2.5 rounded-xl border border-slate-200/80 dark:border-navy-800">
              {pollutant.description}
            </p>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-1">
              <span className="font-semibold block flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3 h-3" /> Health Impact:
              </span>
              <p className="text-[11px] leading-tight text-slate-700 dark:text-slate-300">
                {pollutant.healthEffects}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
