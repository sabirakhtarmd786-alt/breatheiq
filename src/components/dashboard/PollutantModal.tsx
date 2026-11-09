"use client";

import { useEffect } from "react";
import { X, ShieldAlert, AlertTriangle, Factory, HeartPulse, CheckCircle2, Info } from "lucide-react";
import { POLLUTANTS } from "@/lib/constants/aqi";
import type { PollutantKey, Measurement } from "@/types";

interface PollutantModalProps {
  pollutant: PollutantKey | null;
  measurement?: Measurement;
  onClose: () => void;
}

const DEEP_DIVE: Record<
  PollutantKey,
  {
    who24h: number;
    whoAnnual: number;
    sources: string[];
    healthEffects: string[];
    mitigation: string[];
  }
> & Record<string, any> = {
  pm2_5: {
    who24h: 15,
    whoAnnual: 5,
    sources: [
      "Motor vehicle exhaust (especially diesel engines)",
      "Industrial combustion and coal power generation",
      "Biomass, crop residue, and garbage burning",
      "Domestic wood and kerosene cooking stoves",
    ],
    healthEffects: [
      "Penetrates deep into alveolar air sacs and bloodstream",
      "Triggers asthma, bronchitis, and reduced lung capacity",
      "Aggravates ischemic heart disease and cardiac arrhythmia",
      "Classified by IARC as Group 1 Human Carcinogen",
    ],
    mitigation: [
      "Run certified True HEPA (H13) air purifiers indoors",
      "Wear certified N95 / FFP2 respirators with tight facial seal",
      "Seal windows and doorways during morning and evening peak inversion",
      "Avoid outdoor running or high-aerobic exercise during high spikes",
    ],
  },
  pm25: {
    who24h: 15,
    whoAnnual: 5,
    sources: [
      "Motor vehicle exhaust (especially diesel engines)",
      "Industrial combustion and coal power generation",
      "Biomass, crop residue, and garbage burning",
      "Domestic wood and kerosene cooking stoves",
    ],
    healthEffects: [
      "Penetrates deep into alveolar air sacs and bloodstream",
      "Triggers asthma, bronchitis, and reduced lung capacity",
      "Aggravates ischemic heart disease and cardiac arrhythmia",
      "Classified by IARC as Group 1 Human Carcinogen",
    ],
    mitigation: [
      "Run certified True HEPA (H13) air purifiers indoors",
      "Wear certified N95 / FFP2 respirators with tight facial seal",
      "Seal windows and doorways during morning and evening peak inversion",
      "Avoid outdoor running or high-aerobic exercise during high spikes",
    ],
  },
  pm10: {
    who24h: 45,
    whoAnnual: 15,
    sources: [
      "Road dust resuspension by passing vehicular traffic",
      "Construction, excavation, and demolition sites",
      "Agricultural tilling and topsoil erosion",
      "Natural dust storms, pollen, and fungal spores",
    ],
    healthEffects: [
      "Deposits in the upper respiratory tract and trachea",
      "Causes persistent throat irritation, coughing, and wheezing",
      "Aggravates allergic rhinitis and preexisting asthma",
      "Reduces physical stamina during outdoor exertion",
    ],
    mitigation: [
      "Wear dust-resistant masks or standard triple-layer surgical masks",
      "Rinse eyes and gargle after spending extended time outside",
      "Enforce misting/wet-suppression on dusty driveways",
      "Inspect and clean window mesh screens regularly",
    ],
  },
  no2: {
    who24h: 25,
    whoAnnual: 10,
    sources: [
      "High-temperature combustion in automobiles and trucks",
      "Gas-fired boilers, furnaces, and fossil fuel power plants",
      "Indoor unvented gas cooktops and kerosene heaters",
    ],
    healthEffects: [
      "Inflames airway lining and elevates susceptibility to respiratory infections",
      "Increases airway responsiveness in asthmatic individuals",
      "Acts as a primary precursor for secondary PM2.5 and ground-level ozone",
    ],
    mitigation: [
      "Avoid busy roadside walking during peak rush hours",
      "Ensure robust kitchen range hood exhaust while cooking with gas",
      "Use indoor purifiers with activated carbon adsorption filters",
    ],
  },
  so2: {
    who24h: 40,
    whoAnnual: 20,
    sources: [
      "Burning of coal, heavy fuel oils, and petcoke in industry",
      "Petroleum refining and metal smelting operations",
      "Diesel vehicles using high-sulfur diesel fuel",
    ],
    healthEffects: [
      "Causes rapid bronchoconstriction within minutes of inhalation",
      "Triggers severe coughing, throat tightness, and eye burning",
      "Combines with atmospheric moisture to form acid aerosols",
    ],
    mitigation: [
      "Stay indoors when industrial plumes or thermal inversion occur",
      "Individuals with asthma should keep rescue bronchodilators accessible",
      "Wash face and exposed skin after high industrial-zone exposure",
    ],
  },
  co: {
    who24h: 4, // mg/m³ (24h)
    whoAnnual: 4,
    sources: [
      "Incomplete combustion of gasoline, wood, charcoal, and coal",
      "Idling engines in enclosed parking garages and tunnels",
      "Faulty water heaters, room heaters, and blocked chimneys",
    ],
    healthEffects: [
      "Binds to hemoglobin with 200x greater affinity than oxygen",
      "Reduces systemic oxygen delivery to the brain and heart tissue",
      "Causes headaches, dizziness, fatigue, and impaired coordination",
    ],
    mitigation: [
      "Never run generators or charcoal fires in enclosed spaces",
      "Install certified carbon monoxide detectors near bedrooms",
      "Service vehicular exhaust systems and catalytic converters promptly",
    ],
  },
  o3: {
    who24h: 100, // 8h average
    whoAnnual: 60,
    sources: [
      "Photochemical reaction between NOx and VOCs under intense sunlight",
      "Not emitted directly — peaks during hot, sunny afternoons",
      "High contribution from chemical solvents, paints, and vehicle vapors",
    ],
    healthEffects: [
      "Strong oxidizing agent that chemically damages cellular lining",
      "Causes sharp chest pain upon deep inhalation during exercise",
      "Permanently accelerates aging of lung tissues with chronic exposure",
    ],
    mitigation: [
      "Reschedule outdoor sports to morning hours before peak sunlight",
      "Close windows during sunny afternoons when urban smog forms",
      "Increase dietary antioxidants (Vitamin C & E) to combat oxidative stress",
    ],
  },
};

export function PollutantModal({
  pollutant,
  measurement,
  onClose,
}: PollutantModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!pollutant) return null;

  const info = POLLUTANTS[pollutant];
  const deep = DEEP_DIVE[pollutant];
  const val = measurement?.value;
  const ratio =
    val !== undefined && deep.who24h > 0
      ? (val / deep.who24h).toFixed(1)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg border border-emerald-500/30">
              {info.name}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{info.fullName}</h2>
              <p className="text-xs text-slate-400">Scientific Health & Impact Brief</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Current Reading vs WHO guideline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Current Monitored Level
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100">
                  {val !== undefined ? val.toFixed(1) : "—"}
                </span>
                <span className="text-sm text-slate-400">{info.unit}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Source: {measurement?.source || "Modeled Telemetry"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                WHO 24-Hour Air Quality Guideline
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {deep.who24h}
                </span>
                <span className="text-sm text-slate-400">{info.unit}</span>
              </div>
              {ratio && (
                <p className="text-xs font-medium text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Currently {ratio}× the WHO recommended safe limit
                </p>
              )}
            </div>
          </div>

          {/* Biological Health Impact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <HeartPulse className="w-4 h-4 text-red-400" />
              Health & Physiological Effects
            </h3>
            <ul className="space-y-2">
              {deep.healthEffects.map((effect, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{effect}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary Sources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Factory className="w-4 h-4 text-amber-400" />
              Primary Emission Sources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deep.sources.map((src, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <span className="text-amber-400 font-bold shrink-0">→</span>
                  <span>{src}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Protective Action */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recommended Protective Measures
            </h3>
            <div className="space-y-2">
              {deep.mitigation.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                >
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Standards: WHO Global Air Quality Guidelines & US-EPA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
}
