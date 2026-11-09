'use client';

import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Wind, 
  Trees, 
  Activity, 
  Baby, 
  Heart, 
  Users, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { POLLUTANT_METADATA } from '@/lib/aqi/calculator';
import { PollutantKey } from '@/types';

export function HealthDashboard() {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantKey>('pm2_5');

  const SENSITIVE_GROUPS = [
    {
      id: 'asthma',
      name: 'Asthma & COPD Patients',
      icon: Activity,
      risk: 'Severe',
      riskColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      description: 'Microscopic particulates ($PM_{2.5}$) and sulfur dioxide ($SO_2$) induce acute bronchospasms, airway inflammation, and trigger violent asthma attacks.',
      actions: [
        'Carry quick-relief rescue bronchodilator inhalers at all times.',
        'Avoid outdoor cardio or brisk walking during morning and twilight smog peaks.',
        'Use airtight certified N95 respirators whenever outdoor exposure is unavoidable.',
        'Run HEPA air purifiers in sleeping quarters continuously.',
      ],
    },
    {
      id: 'cardiovascular',
      name: 'Heart Disease & Hypertension',
      icon: Heart,
      risk: 'High',
      riskColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      description: 'Ultrafine particulates pass through the alveoli membrane directly into the bloodstream, elevating arterial blood pressure, arterial plaque rupture, and cardiac arrhythmias.',
      actions: [
        'Monitor resting blood pressure closely during high-AQI episodes.',
        'Refrain from strenuous physical exertion, heavy lifting, or uphill cycling in smoggy air.',
        'Consult cardiologist if experiencing irregular heartbeat, chest tightness, or dizziness.',
      ],
    },
    {
      id: 'children',
      name: 'Children & Infants',
      icon: Baby,
      risk: 'Critical',
      riskColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      description: 'Children breathe faster than adults and inhale larger volumes of air relative to body weight while their pulmonary immune defenses are still developing.',
      actions: [
        'Suspend outdoor school sports, recess, and playground visits when AQI > 150.',
        'Ensure indoor play environments are filtered with clean ventilation.',
        'Maintain hydration to keep respiratory mucous membranes moist.',
      ],
    },
    {
      id: 'elderly',
      name: 'Elderly Individuals (65+)',
      icon: Users,
      risk: 'High',
      riskColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      description: 'Decreased lung elasticity and reduced cardiovascular reserve make elderly people particularly susceptible to pulmonary infections and stroke.',
      actions: [
        'Shift daily morning walks to well-ventilated indoor corridors or wait until afternoon sun.',
        'Stay indoors during winter fog and post-sunset thermal inversion peaks.',
      ],
    },
  ];

  const MASK_TYPES = [
    {
      name: 'N95 / FFP2 / KN95 Mask',
      efficacy: '95%+ Filtration',
      rating: 'Highly Recommended',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      details: 'Electrostatic melt-blown polypropylene filter stops sub-micron particles down to 0.3 micrometers. Provides optimal protection against PM2.5 and wildfire/Diwali smoke when fitted hermetically without facial gaps.',
    },
    {
      name: 'Surgical 3-Ply Mask',
      efficacy: '~30-40% Filtration of PM2.5',
      rating: 'Limited Efficacy',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      details: 'Blocks large droplet splashes and coarse dust (PM10), but lacks an airtight facial seal. Fine PM2.5 particles easily bypass perimeter edges during inhalation.',
    },
    {
      name: 'Cloth / Bandana',
      efficacy: '<15% Filtration',
      rating: 'Ineffective for Smog',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      details: 'Pores in cloth and fabric are too large (typically 50–100 microns) to trap fine combustion particulates ($PM_{2.5}$). Gives a false sense of security during heavy smog.',
    },
  ];

  const pollutantKeys: PollutantKey[] = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'];
  const activeMeta = POLLUTANT_METADATA[selectedPollutant];

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <HeartPulse className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Health Guidance & Chemical Precautions Hub
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Comprehensive medical-grade environmental health guidance, vulnerable population advisories, and certified personal protective equipment (PPE) recommendations.
        </p>
      </div>

      {/* Sensitive Populations Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Vulnerable & High-Risk Groups Advisory
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SENSITIVE_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-850 flex items-center justify-center text-slate-700 dark:text-slate-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {group.name}
                      </h4>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${group.riskColor}`}>
                      {group.risk} Risk
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Protective Actions:
                  </span>
                  {group.actions.map((act, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* PPE & Mask Effectiveness Evaluation */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Respiratory PPE & Mask Standards Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MASK_TYPES.map((m, i) => (
            <Card key={i} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeClass}`}>
                    {m.rating}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mb-2">
                  {m.efficacy}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.details}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chemical Pollutant Educational Deep-Dive */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Criteria Pollutants Chemical & Toxicological Directory
            </CardTitle>
            <CardDescription>
              Select any pollutant to inspect its formation chemistry, physiological absorption mechanisms, and official WHO standards.
            </CardDescription>
          </div>
        </div>

        {/* Pollutant Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {pollutantKeys.map((k) => {
            const meta = POLLUTANT_METADATA[k];
            const isSel = selectedPollutant === k;
            return (
              <button
                key={k}
                onClick={() => setSelectedPollutant(k)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSel
                    ? 'bg-slate-900 text-emerald-400 border-emerald-400 dark:bg-navy-850 shadow-md'
                    : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                {meta.chemicalFormula} ({meta.name.split(' ')[0]})
              </button>
            );
          })}
        </div>

        {/* Selected Pollutant Deep-Dive Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                  {activeMeta.chemicalFormula}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeMeta.name}
                </h4>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Primary Standard: {activeMeta.epaThreshold} {activeMeta.unit} • WHO 24-hr Guideline: {activeMeta.whoThreshold} {activeMeta.unit}
              </span>
            </div>

            <Badge variant="info">
              Continuous Ambient Metric
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Description & Sources */}
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Chemical Description & Formation:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeMeta.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Primary Combustion & Environmental Sources:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeMeta.sources.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Physiological & Health Impact */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-2">
              <span className="font-bold text-sm text-rose-300 block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Human Physiological Health Effects:
              </span>
              <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                {activeMeta.healthEffects}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-200 block">
            Official Environmental Health Disclaimer:
          </span>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            The health insights, activity guidance, and educational explanations provided on BreatheIQ are designed solely for public educational awareness and general environmental risk mitigation. They do not constitute personalized medical diagnosis, prescription, or clinical treatment. Individuals with pre-existing cardiopulmonary disorders should consult their licensed medical physician.
          </p>
        </div>
      </div>
    </div>
  );
}
