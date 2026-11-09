'use client';

import React from 'react';
import { AQICategory } from '@/types';
import { HeartPulse, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuickHealthPreviewProps {
  category: AQICategory;
  onExploreHealth: () => void;
}

export function QuickHealthPreview({ category, onExploreHealth }: QuickHealthPreviewProps) {
  const getGuidance = () => {
    switch (category) {
      case 'good':
        return {
          exercise: { status: 'Ideal', text: 'Air is clean. Great conditions for outdoor running, cycling, and sports.' },
          mask: { status: 'Not Needed', text: 'Normal breathing conditions.' },
          ventilation: { status: 'Recommended', text: 'Open windows to bring fresh natural air indoors.' },
          sensitive: { status: 'Low Risk', text: 'Safe for children, elderly, and individuals with asthma.' },
        };
      case 'moderate':
        return {
          exercise: { status: 'Acceptable', text: 'Outdoor sports allowed; unusually sensitive people should take breaks.' },
          mask: { status: 'Optional', text: 'Only recommended for highly allergic individuals.' },
          ventilation: { status: 'Normal', text: 'Natural ventilation is acceptable.' },
          sensitive: { status: 'Moderate', text: 'Watch for coughing or slight shortness of breath in sensitive groups.' },
        };
      case 'sensitive':
        return {
          exercise: { status: 'Reduce Exertion', text: 'Limit intense outdoor workouts; move heavy sessions indoors.' },
          mask: { status: 'Advised', text: 'Wear N95/KN95 masks if outdoors for prolonged periods.' },
          ventilation: { status: 'Limit Windows', text: 'Keep windows closed during morning & evening peak pollution hours.' },
          sensitive: { status: 'Caution', text: 'Asthma patients should keep rescue inhalers accessible.' },
        };
      case 'unhealthy':
        return {
          exercise: { status: 'Avoid Outdoor', text: 'Avoid jogging or aerobic exertion outside. Exercise indoors.' },
          mask: { status: 'N95 Mandatory', text: 'High particulate penetration. Use certified N95 / FFP2 respirators.' },
          ventilation: { status: 'Keep Closed', text: 'Keep windows closed and run HEPA air purifiers.' },
          sensitive: { status: 'High Alert', text: 'Children and elderly should stay strictly indoors.' },
        };
      case 'veryUnhealthy':
      case 'hazardous':
        return {
          exercise: { status: 'Prohibited', text: 'Emergency conditions! Severe risk to pulmonary and cardiovascular systems.' },
          mask: { status: 'Hermetic N95', text: 'Do not step outdoors without an airtight particulate mask.' },
          ventilation: { status: 'Purifier Active', text: 'Seal indoor spaces. Run indoor air purifiers at maximum mode.' },
          sensitive: { status: 'Emergency', text: 'Consult physician immediately if experiencing chest pain or wheezing.' },
        };
      default:
        return {
          exercise: { status: 'Moderate', text: 'Normal activities acceptable; sensitive people should monitor symptoms.' },
          mask: { status: 'Optional', text: 'Use precautionary mask during peak traffic hours.' },
          ventilation: { status: 'Normal', text: 'Moderate natural ventilation acceptable.' },
          sensitive: { status: 'Caution', text: 'Sensitive individuals should limit prolonged outdoor exertion.' },
        };
    }
  };

  const guidance = getGuidance();

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-md backdrop-blur-md p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Health & Activity Advisory
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Personal Protective Actions
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExploreHealth}
          className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold gap-1 p-0 h-auto"
        >
          View Full Guide
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Advisory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Outdoor Sports</span>
            <span className="font-bold text-emerald-500 text-[11px]">{guidance.exercise.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {guidance.exercise.text}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Mask Guidance</span>
            <span className="font-bold text-amber-500 text-[11px]">{guidance.mask.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {guidance.mask.text}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Indoor Air / Windows</span>
            <span className="font-bold text-teal-400 text-[11px]">{guidance.ventilation.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {guidance.ventilation.text}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Sensitive Groups</span>
            <span className="font-bold text-rose-400 text-[11px]">{guidance.sensitive.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {guidance.sensitive.text}
          </p>
        </div>
      </div>
    </div>
  );
}
