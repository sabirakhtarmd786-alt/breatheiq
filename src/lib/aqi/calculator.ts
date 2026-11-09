// ============================================================
// BreatheIQ — US-EPA AQI Calculator
// ============================================================
// Standard: US-EPA AQI Technical Assistance Document (2018 revision)
// Formula: Ip = ((IHi - ILo)/(BHi - BLo)) * (Cp - BLo) + ILo
// ============================================================

import {
  PM25_BREAKPOINTS,
  PM10_BREAKPOINTS,
  NO2_BREAKPOINTS_PPB,
  O3_BREAKPOINTS_PPB,
  CO_BREAKPOINTS_PPM,
  SO2_BREAKPOINTS_PPB,
  getAQICategory,
  type AQIBreakpoint,
} from "@/lib/constants/aqi";
import type { AQIResult, PollutantKey, Measurement } from "@/types";

function linearInterpolate(
  concentration: number,
  breakpoints: AQIBreakpoint[]
): number | null {
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) *
          (concentration - bp.cLow) +
          bp.iLow
      );
    }
  }
  return null;
}

/** Convert µg/m³ NO2 → ppb (approximate at 25°C, 1 atm) */
function no2UgM3ToPpb(ugm3: number): number {
  return ugm3 / 1.88;
}

/** Convert µg/m³ SO2 → ppb */
function so2UgM3ToPpb(ugm3: number): number {
  return ugm3 / 2.62;
}

/** Convert µg/m³ O3 → ppb */
function o3UgM3ToPpb(ugm3: number): number {
  return ugm3 / 2.0;
}

/** Convert mg/m³ CO → ppm */
function coMgM3ToPpm(mgm3: number): number {
  return mgm3 / 1.145;
}

export function calculateSubAQI(
  pollutant: PollutantKey,
  value: number,
  unit: string
): number | null {
  if (!isFinite(value) || value < 0) return null;

  switch (pollutant) {
    case "pm25": {
      // OpenAQ returns µg/m³
      const v = Math.round(value * 10) / 10; // 1 decimal
      return linearInterpolate(v, PM25_BREAKPOINTS);
    }
    case "pm10": {
      const v = Math.round(value);
      return linearInterpolate(v, PM10_BREAKPOINTS);
    }
    case "no2": {
      // OpenAQ returns µg/m³, need ppb
      const ppb = no2UgM3ToPpb(value);
      return linearInterpolate(Math.round(ppb), NO2_BREAKPOINTS_PPB);
    }
    case "o3": {
      // OpenAQ returns µg/m³, need ppb
      const ppb = o3UgM3ToPpb(value);
      return linearInterpolate(Math.round(ppb), O3_BREAKPOINTS_PPB);
    }
    case "co": {
      // OpenAQ returns mg/m³, need ppm
      const ppm = coMgM3ToPpm(value);
      return linearInterpolate(Math.round(ppm * 10) / 10, CO_BREAKPOINTS_PPM);
    }
    case "so2": {
      // OpenAQ returns µg/m³, need ppb
      const ppb = so2UgM3ToPpb(value);
      return linearInterpolate(Math.round(ppb), SO2_BREAKPOINTS_PPB);
    }
    default:
      return null;
  }
}

export function calculateAQI(
  measurements: Partial<Record<PollutantKey, Measurement>>
): AQIResult {
  const subAqis: { pollutant: PollutantKey; aqi: number }[] = [];

  for (const [key, measurement] of Object.entries(measurements)) {
    if (!measurement) continue;
    const pollutant = key as PollutantKey;
    const sub = calculateSubAQI(
      pollutant,
      measurement.value,
      measurement.unit
    );
    if (sub !== null) {
      subAqis.push({ pollutant, aqi: sub });
    }
  }

  if (subAqis.length === 0) {
    return {
      value: 0,
      category: "Unknown",
      color: "#9ca3af",
      textColor: "text-gray-400",
      dominantPollutant: null,
      standard: "US-EPA",
      calculated: false,
      message: "Insufficient data to calculate AQI",
    };
  }

  const highest = subAqis.reduce((a, b) => (a.aqi > b.aqi ? a : b));
  const cat = getAQICategory(highest.aqi);

  return {
    value: highest.aqi,
    category: cat.label as AQIResult["category"],
    color: cat.color,
    textColor: cat.darkTextColor,
    dominantPollutant: highest.pollutant,
    standard: "US-EPA",
    calculated: true,
  };
}

