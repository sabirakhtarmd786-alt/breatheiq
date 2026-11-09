"use client";

import { useState } from "react";
import { User, Activity, Baby, ShieldAlert, Home, Clock, Check, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonaActivityMatrixProps {
  aqiValue: number;
  aqiCategory: string;
}

export function PersonaActivityMatrix({
  aqiValue,
  aqiCategory,
}: PersonaActivityMatrixProps) {
  const [activeTab, setActiveTab] = useState<"athletes" | "kids" | "elderly" | "home">("athletes");

  // Determine guidance based on AQI
  const isGood = aqiValue <= 50;
  const isModerate = aqiValue > 50 && aqiValue <= 100;
  const isSensitive = aqiValue > 100 && aqiValue <= 150;
  const isUnhealthy = aqiValue > 150 && aqiValue <= 200;
  const isVeryHazardous = aqiValue > 200;

  const personas = {
    athletes: {
      title: "Joggers & Athletes",
      icon: Activity,
      status: isGood ? "Optimal" : isModerate ? "Moderate" : isSensitive ? "Caution" : "Avoid Outdoor",
      statusColor: isGood ? "text-emerald-400 bg-emerald-500/10" : isModerate ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10",
      bestHours: isGood ? "Anytime" : "12:00 PM – 4:00 PM (avoid rush-hour inversions)",
      advice: isGood
        ? "Excellent conditions for marathons, sprints, and cycling. Full lung expansion safe."
        : isModerate
        ? "Safe for general workouts. Extremely sensitive runners may feel mild throat dryness."
        : isSensitive
        ? "Shift high-intensity HIIT or long-distance running to indoor gyms or early afternoon."
        : "Do NOT jog or run outdoors. Heavy respiratory intake will inhale toxic fine particulates directly into alveolar blood vessels.",
    },
    kids: {
      title: "Children & Schools",
      icon: Baby,
      status: isGood ? "Safe Outdoor" : isModerate ? "Normal" : isSensitive ? "Limit Play" : "Keep Indoors",
      statusColor: isGood ? "text-emerald-400 bg-emerald-500/10" : isModerate ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10",
      bestHours: isGood ? "All day" : "11:00 AM – 3:30 PM",
      advice: isGood
        ? "Safe for all school sports, playground activities, and outdoor field trips."
        : isModerate
        ? "Normal recess activities allowed. Monitor children with known asthma symptoms."
        : isSensitive
        ? "Limit prolonged outdoor physical education classes. Keep asthma rescue inhalers ready."
        : "Recess and sports should be moved strictly indoors. Developing lungs breathe 50% more air per pound of body weight.",
    },
    elderly: {
      title: "Elderly & Sensitive Groups",
      icon: ShieldAlert,
      status: isGood ? "Good" : isModerate ? "Mild Caution" : isSensitive ? "Stay Indoors" : "Health Warning",
      statusColor: isGood ? "text-emerald-400 bg-emerald-500/10" : isModerate ? "text-yellow-400 bg-yellow-500/10" : "text-purple-400 bg-purple-500/10",
      bestHours: isGood ? "Pleasant morning/evening" : "Afternoon sunny window",
      advice: isGood
        ? "Pleasant air quality. Outdoor walks in parks recommended."
        : isModerate
        ? "Limit extended walks near heavy traffic corridors. Maintain normal hydration."
        : isSensitive
        ? "Avoid morning winter walks. Cold air traps vehicle exhausts near ground level."
        : "Stay inside with windows closed. Monitor blood pressure and pulse oximeter readings if cardiopulmonary conditions exist.",
    },
    home: {
      title: "Home & Ventilation",
      icon: Home,
      status: isGood ? "Open Windows" : isModerate ? "Ventilate" : isSensitive ? "Filtered Only" : "Seal Windows",
      statusColor: isGood ? "text-emerald-400 bg-emerald-500/10" : isModerate ? "text-yellow-400 bg-yellow-500/10" : "text-amber-400 bg-amber-500/10",
      bestHours: isGood ? "Open 24/7" : "1:00 PM – 4:00 PM (lowest ambient stagnation)",
      advice: isGood
        ? "Open all cross-ventilation windows to flush indoor VOCs and stale air."
        : isModerate
        ? "Brief afternoon window ventilation (30 mins) recommended to cycle indoor CO2."
        : isSensitive
        ? "Keep windows sealed during morning and night. Run HEPA purifiers on auto mode."
        : "Keep all windows firmly shut. Run air purifiers on high. Use wet mop rather than dry sweeping to prevent indoor dust resuspension.",
    },
  };

  const current = personas[activeTab];
  const Icon = current.icon;

  return (
    <div className="space-y-4">
      {/* Persona Tab Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(personas) as (keyof typeof personas)[]).map((key) => {
          const p = personas[key];
          const PIcon = p.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border text-left",
                isActive
                  ? "bg-slate-700/90 text-emerald-400 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/50 hover:bg-slate-700/40"
              )}
            >
              <PIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{p.title.split("&")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Guidance Card */}
      <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 transition-all duration-200">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">{current.title}</span>
          </div>
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border border-current/20",
              current.statusColor
            )}
          >
            {current.status}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-2">{current.advice}</p>

        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong className="text-slate-300">Recommended Time Window:</strong> {current.bestHours}
          </span>
        </div>
      </div>
    </div>
  );
}

