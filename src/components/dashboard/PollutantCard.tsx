'use client';

import React, { useState } from 'react';
import { PollutantMeasurement } from '@/types';
import { getAQIColorHex } from '@/lib/aqi/calculator';
import { Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollutantCardProps {
  pollutant: PollutantMeasurement;
}

export function PollutantCard({ pollutant }: PollutantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorHex = getAQIColorHex(pollutant.category);

  // WHO threshold ratio
  const ratioToWho = (pollutant.value / (pollutant.whoThreshold || 1)).toFixed(1);
  const isOverWho = pollutant.value > pollutant.whoThreshold;

  // Percentage of EPA threshold standard capped at 100 for visual bar
  const epaPercent = Math.min(100, Math.round((pollutant.value / (pollutant.epaThreshold || 1)) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 hover:border-slate-300 dark:hover:border-navy-700 transition-all duration-300 flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm tracking-tight border transition-transform group-hover:scale-105"
              style={{
                backgroundColor: `${colorHex}15`,
                borderColor: `${colorHex}40`,
                color: colorHex,
              }}
            >
              {pollutant.chemicalFormula}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {pollutant.name}
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Ambient Air Measure
              </span>
            </div>
          </div>

          {/* Sub-index AQI Pill */}
          <div 
            className="px-2.5 py-1 rounded-lg text-xs font-bold border"
            style={{
              backgroundColor: `${colorHex}15`,
              borderColor: `${colorHex}30`,
              color: colorHex,
            }}
          >
            AQI {pollutant.aqiValue}
          </div>
        </div>

        {/* Big Concentration Value */}
        <div className="flex items-baseline gap-2 my-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {pollutant.value}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {pollutant.unit}
          </span>
        </div>

        {/* EPA Standard Comparison Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">EPA Standard Ratio</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {epaPercent}% of Limit
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${epaPercent}%`,
                backgroundColor: colorHex,
              }}
            />
          </div>
        </div>

        {/* WHO Guideline Chip */}
        <div className="mt-3 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
          <span className="text-slate-500 dark:text-slate-400">WHO 24h Guideline:</span>
          <span className={cn(
            'font-semibold',
            isOverWho ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
          )}>
            {pollutant.whoThreshold} {pollutant.unit} ({ratioToWho}×)
          </span>
        </div>
      </div>

      {/* Expandable Explanation Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800">
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
