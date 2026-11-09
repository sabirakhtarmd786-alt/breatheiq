import { AQICategory, AQIResult, PollutantKey, PollutantMeasurement } from '@/types';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// Official US EPA Breakpoints (40 CFR Part 58, Appendix G)
// Concentrations in ug/m3 (except CO converted accordingly)
const BREAKPOINTS: Record<PollutantKey, Breakpoint[]> = {
  pm2_5: [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 108, iLow: 0, iHigh: 50 },
    { cLow: 109, cHigh: 140, iLow: 51, iHigh: 100 },
    { cLow: 141, cHigh: 170, iLow: 101, iHigh: 150 },
    { cLow: 171, cHigh: 210, iLow: 151, iHigh: 200 },
    { cLow: 211, cHigh: 400, iLow: 201, iHigh: 300 },
    { cLow: 401, cHigh: 800, iLow: 301, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 100, iLow: 0, iHigh: 50 },
    { cLow: 101, cHigh: 188, iLow: 51, iHigh: 100 },
    { cLow: 189, cHigh: 677, iLow: 101, iHigh: 150 },
    { cLow: 678, cHigh: 1221, iLow: 151, iHigh: 200 },
    { cLow: 1222, cHigh: 2349, iLow: 201, iHigh: 300 },
    { cLow: 2350, cHigh: 3850, iLow: 301, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 92, iLow: 0, iHigh: 50 },
    { cLow: 93, cHigh: 197, iLow: 51, iHigh: 100 },
    { cLow: 198, cHigh: 485, iLow: 101, iHigh: 150 },
    { cLow: 486, cHigh: 797, iLow: 151, iHigh: 200 },
    { cLow: 798, cHigh: 1584, iLow: 201, iHigh: 300 },
    { cLow: 1585, cHigh: 2620, iLow: 301, iHigh: 500 },
  ],
  co: [
    // In ug/m3: 0-5000 ug/m3 is 0-4.4 ppm -> AQI 0-50
    { cLow: 0, cHigh: 5000, iLow: 0, iHigh: 50 },
    { cLow: 5001, cHigh: 10800, iLow: 51, iHigh: 100 },
    { cLow: 10801, cHigh: 14200, iLow: 101, iHigh: 150 },
    { cLow: 14201, cHigh: 17600, iLow: 151, iHigh: 200 },
    { cLow: 17601, cHigh: 34800, iLow: 201, iHigh: 300 },
    { cLow: 34801, cHigh: 57500, iLow: 301, iHigh: 500 },
  ],
};

export const POLLUTANT_METADATA: Record<
  PollutantKey,
  {
    name: string;
    chemicalFormula: string;
    unit: string;
    whoThreshold: number;
    epaThreshold: number;
    description: string;
    sources: string[];
    healthEffects: string;
  }
> = {
  pm2_5: {
    name: 'Fine Particulate Matter',
    chemicalFormula: 'PM₂.₅',
    unit: 'µg/m³',
    whoThreshold: 15, // WHO 24-hr guideline
    epaThreshold: 35, // EPA 24-hr standard
    description: 'Inhalable particles with diameters 2.5 micrometers or smaller, able to penetrate deep into lungs and bloodstream.',
    sources: ['Combustion engines', 'Industrial emissions', 'Crop burning', 'Fireplaces', 'Dust storms'],
    healthEffects: 'Causes cardiovascular disease, aggravated asthma, reduced lung function, and premature mortality.',
  },
  pm10: {
    name: 'Coarse Particulate Matter',
    chemicalFormula: 'PM₁₀',
    unit: 'µg/m³',
    whoThreshold: 45, // WHO 24-hr guideline
    epaThreshold: 150, // EPA 24-hr standard
    description: 'Inhalable particles with diameters 10 micrometers or smaller, causing upper respiratory irritation.',
    sources: ['Road dust', 'Construction sites', 'Agriculture', 'Mining operations', 'Pollen'],
    healthEffects: 'Irritates eyes, nose, throat, triggers respiratory distress, and exacerbates bronchitis.',
  },
  no2: {
    name: 'Nitrogen Dioxide',
    chemicalFormula: 'NO₂',
    unit: 'µg/m³',
    whoThreshold: 25, // WHO 24-hr guideline
    epaThreshold: 100, // EPA 1-hr standard
    description: 'Reddish-brown toxic gas produced from fossil fuel combustion at high temperatures.',
    sources: ['Vehicles & traffic exhaust', 'Power plants', 'Diesel generators', 'Industrial boilers'],
    healthEffects: 'Inflames airways, causes coughing, wheezing, and increases susceptibility to lung infections.',
  },
  so2: {
    name: 'Sulfur Dioxide',
    chemicalFormula: 'SO₂',
    unit: 'µg/m³',
    whoThreshold: 40, // WHO 24-hr guideline
    epaThreshold: 75, // EPA 1-hr standard
    description: 'Colorless pungent gas generated from burning fossil fuels containing sulfur.',
    sources: ['Coal-fired power generation', 'Oil refineries', 'Smelting facilities', 'Volcanic activity'],
    healthEffects: 'Causes throat irritation, bronchoconstriction, and contributes to acid rain formation.',
  },
  co: {
    name: 'Carbon Monoxide',
    chemicalFormula: 'CO',
    unit: 'µg/m³',
    whoThreshold: 4000, // WHO 24-hr guideline
    epaThreshold: 10000, // EPA 8-hr standard
    description: 'Colorless, odorless, poisonous gas formed by incomplete combustion of carbon-containing fuels.',
    sources: ['Internal combustion engines', 'Faulty gas heaters', 'Biomass burning', 'Tobacco smoke'],
    healthEffects: 'Reduces oxygen delivery to organs and tissues; causes headaches, fatigue, and can be fatal at high levels.',
  },
  o3: {
    name: 'Ground-Level Ozone',
    chemicalFormula: 'O₃',
    unit: 'µg/m³',
    whoThreshold: 100, // WHO 8-hr guideline
    epaThreshold: 140, // EPA 8-hr standard
    description: 'Secondary photochemical pollutant formed by sunlight reacting with volatile organic compounds and nitrogen oxides.',
    sources: ['Photochemical reaction of traffic emissions in hot sunlight', 'Solvents', 'Industrial plumes'],
    healthEffects: 'Damages lung tissue, triggers asthma attacks, chest pain, and diminishes athletic endurance.',
  },
};

/**
 * Calculates pollutant-specific AQI using US EPA Piecewise Linear Interpolation
 * Ip = [ (IHi - ILo) / (BPHi - BPLo) ] * (Cp - BPLo) + ILo
 */
export function calculatePollutantAQI(pollutant: PollutantKey, concentration: number): number {
  if (concentration < 0 || isNaN(concentration)) return 0;

  const breakpoints = BREAKPOINTS[pollutant];
  if (!breakpoints) return 0;

  // Find corresponding breakpoint bracket
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  // If concentration exceeds highest bracket
  const highest = breakpoints[breakpoints.length - 1];
  if (concentration > highest.cHigh) {
    // Extrapolate capped at 500
    const aqi = ((500 - highest.iLow) / (highest.cHigh - highest.cLow)) * (concentration - highest.cLow) + highest.iLow;
    return Math.min(500, Math.round(aqi));
  }

  return 0;
}

export function getCategoryFromAQI(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'veryUnhealthy';
  return 'hazardous';
}

export function getAQILabel(category: AQICategory): string {
  switch (category) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'sensitive': return 'Unhealthy for Sensitive Groups';
    case 'unhealthy': return 'Unhealthy';
    case 'veryUnhealthy': return 'Very Unhealthy';
    case 'hazardous': return 'Hazardous';
  }
}

export function getAQIColorHex(category: AQICategory): string {
  switch (category) {
    case 'good': return '#10B981';
    case 'moderate': return '#F59E0B';
    case 'sensitive': return '#F97316';
    case 'unhealthy': return '#EF4444';
    case 'veryUnhealthy': return '#A855F7';
    case 'hazardous': return '#881337';
  }
}

/**
 * Calculates overall multi-pollutant AQI and identifies the dominant pollutant
 */
export function calculateOverallAQI(
  rawValues: Partial<Record<PollutantKey, number>>,
  overrideAQI?: number
): AQIResult {
  let maxAQI = 0;
  let dominant: PollutantKey = 'pm2_5';

  const keys: PollutantKey[] = ['pm2_5', 'pm10', 'o3', 'no2', 'so2', 'co'];

  for (const key of keys) {
    const val = rawValues[key];
    if (val !== undefined && val !== null && !isNaN(val)) {
      const ind = calculatePollutantAQI(key, val);
      if (ind > maxAQI) {
        maxAQI = ind;
        dominant = key;
      }
    }
  }

  // If external validated AQI provided (e.g. from Open-Meteo or OpenAQ) and no raw exceeded
  const finalValue = Math.max(maxAQI, overrideAQI || 0);
  const category = getCategoryFromAQI(finalValue);

  return {
    value: finalValue,
    category,
    label: getAQILabel(category),
    color: getAQIColorHex(category),
    textColor: category === 'good' ? '#10B981' : category === 'moderate' ? '#F59E0B' : '#EF4444',
    bgLight: `${getAQIColorHex(category)}20`,
    description: `Air quality is categorized as ${getAQILabel(category)}. The dominant health-determining pollutant is ${POLLUTANT_METADATA[dominant].name} (${POLLUTANT_METADATA[dominant].chemicalFormula}).`,
    dominantPollutant: dominant,
    standard: 'US_EPA',
    calculatedAt: new Date().toISOString(),
  };
}

export function buildPollutantMeasurements(
  rawValues: Partial<Record<PollutantKey, number>>
): Record<PollutantKey, PollutantMeasurement> {
  const result = {} as Record<PollutantKey, PollutantMeasurement>;

  const keys: PollutantKey[] = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3'];

  for (const key of keys) {
    const meta = POLLUTANT_METADATA[key];
    const val = rawValues[key] ?? 0;
    const aqi = calculatePollutantAQI(key, val);
    const category = getCategoryFromAQI(aqi);

    result[key] = {
      key,
      name: meta.name,
      chemicalFormula: meta.chemicalFormula,
      value: Number(val.toFixed(1)),
      unit: meta.unit,
      aqiValue: aqi,
      category,
      whoThreshold: meta.whoThreshold,
      epaThreshold: meta.epaThreshold,
      description: meta.description,
      sources: meta.sources,
      healthEffects: meta.healthEffects,
    };
  }

  return result;
}
