'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Wind, 
  ShieldCheck, 
  Download, 
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLocation } from '@/context/LocationContext';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  aqiValue?: number;
  aqiCategory?: string;
  categoryColor?: string;
  pm25Value?: number;
  dominantPollutant?: string;
}

export function ShareCardModal({
  isOpen,
  onClose,
  aqiValue = 184,
  aqiCategory = 'Unhealthy',
  categoryColor = '#EF4444',
  pm25Value = 118.5,
  dominantPollutant = 'PM2.5',
}: ShareCardModalProps) {
  const { currentLocation } = useLocation();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = `BreatheIQ Air Quality Intelligence Report for ${currentLocation.name}:
• AQI: ${aqiValue} (${aqiCategory})
• Dominant Pollutant: ${dominantPollutant} (${pm25Value} µg/m³)
• Standard: US EPA Piecewise Breakpoint Calculation
• Telemetry Source: Verified Public Atmospheric & Ground Stations
Track live air quality at BreatheIQ.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Share Air Quality Summary
          </h3>
        </div>

        {/* Visual Share Card */}
        <div 
          id="breatheiq-share-card"
          className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-slate-700 text-white relative overflow-hidden shadow-lg my-3"
        >
          {/* Subtle Glow */}
          <div 
            className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ backgroundColor: categoryColor }}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                <Wind className="w-4 h-4" />
              </div>
              <span className="font-black tracking-tight text-sm text-emerald-400">
                BreatheIQ
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="relative z-10 my-3">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block">
              {currentLocation.name}, {currentLocation.country}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span 
                className="text-5xl font-extrabold tracking-tight"
                style={{ color: categoryColor }}
              >
                {aqiValue}
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase">
                US AQI
              </span>
            </div>
            <span 
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: `${categoryColor}20`,
                borderColor: `${categoryColor}40`,
                color: categoryColor,
              }}
            >
              {aqiCategory}
            </span>
          </div>

          <div className="pt-3 border-t border-navy-700/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>PM2.5: <strong className="text-white">{pm25Value} µg/m³</strong></span>
            <span>EPA Standard</span>
            <span className="text-emerald-400 font-medium">Diwali Challenge 2026</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyText}
            className="flex-1 text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintReport}
            className="text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}
