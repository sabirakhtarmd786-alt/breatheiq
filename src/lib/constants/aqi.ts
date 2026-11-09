// ============================================================
// BreatheIQ — AQI Constants & Pollutant Info
// US-EPA AQI Standard
// ============================================================

import type { PollutantKey, Pollutant } from "@/types";

export const POLLUTANTS: Record<PollutantKey, Pollutant> = {
  pm25: {
    key: "pm25",
    name: "PM2.5",
    fullName: "Fine Particulate Matter",
    unit: "µg/m³",
    description:
      "Fine particles smaller than 2.5 micrometers that can penetrate deep into lungs and bloodstream.",
  },
  pm10: {
    key: "pm10",
    name: "PM10",
    fullName: "Coarse Particulate Matter",
    unit: "µg/m³",
    description:
      "Particles smaller than 10 micrometers that can enter the respiratory system.",
  },
  no2: {
    key: "no2",
    name: "NO₂",
    fullName: "Nitrogen Dioxide",
    unit: "µg/m³",
    description:
      "Gas from vehicle emissions and power plants that irritates airways and contributes to smog.",
  },
  so2: {
    key: "so2",
    name: "SO₂",
    fullName: "Sulfur Dioxide",
    unit: "µg/m³",
    description:
      "Gas from burning fossil fuels that irritates the respiratory system and causes acid rain.",
  },
  co: {
    key: "co",
    name: "CO",
    fullName: "Carbon Monoxide",
    unit: "mg/m³",
    description:
      "Odorless gas from incomplete combustion that reduces oxygen delivery in the body.",
  },
  o3: {
    key: "o3",
    name: "O₃",
    fullName: "Ground-level Ozone",
    unit: "µg/m³",
    description:
      "Ground-level ozone formed from chemical reactions in sunlight that irritates lungs.",
  },
};

// US-EPA AQI Breakpoints
// Source: https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf

export interface AQIBreakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// PM2.5 (µg/m³, 24-hr avg)
export const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500 },
];

// PM10 (µg/m³, 24-hr avg)
export const PM10_BREAKPOINTS: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

// NO2 (µg/m³, 1-hr avg) — convert from ppb: 1 ppb NO2 ≈ 1.88 µg/m³
export const NO2_BREAKPOINTS_PPB: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
  { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
  { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
];

// O3 (µg/m³, 8-hr avg) — convert from ppb: 1 ppb O3 ≈ 2.0 µg/m³
export const O3_BREAKPOINTS_PPB: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
  { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
  { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
  { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
];

// CO (mg/m³, 8-hr avg) — convert from ppm: 1 ppm CO ≈ 1.145 mg/m³
export const CO_BREAKPOINTS_PPM: AQIBreakpoint[] = [
  { cLow: 0.0, cHigh: 4.4, iLow: 0, iHigh: 50 },
  { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
  { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
  { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
  { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
  { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
];

// SO2 (µg/m³, 1-hr avg) — convert from ppb: 1 ppb SO2 ≈ 2.62 µg/m³
export const SO2_BREAKPOINTS_PPB: AQIBreakpoint[] = [
  { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
  { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
  { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
  { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
  { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
  { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
];

export const AQI_CATEGORIES = [
  {
    range: [0, 50],
    label: "Good",
    color: "#00e400",
    bgColor: "bg-green-500",
    textColor: "text-green-700",
    darkTextColor: "text-green-400",
    advice: "Air quality is satisfactory. Enjoy outdoor activities.",
  },
  {
    range: [51, 100],
    label: "Moderate",
    color: "#ffff00",
    bgColor: "bg-yellow-400",
    textColor: "text-yellow-700",
    darkTextColor: "text-yellow-400",
    advice:
      "Sensitive individuals should consider limiting prolonged outdoor exertion.",
  },
  {
    range: [101, 150],
    label: "Unhealthy for Sensitive Groups",
    color: "#ff7e00",
    bgColor: "bg-orange-500",
    textColor: "text-orange-700",
    darkTextColor: "text-orange-400",
    advice:
      "Sensitive groups should limit prolonged outdoor exertion. General public is not likely to be affected.",
  },
  {
    range: [151, 200],
    label: "Unhealthy",
    color: "#ff0000",
    bgColor: "bg-red-500",
    textColor: "text-red-700",
    darkTextColor: "text-red-400",
    advice:
      "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion.",
  },
  {
    range: [201, 300],
    label: "Very Unhealthy",
    color: "#8f3f97",
    bgColor: "bg-purple-600",
    textColor: "text-purple-700",
    darkTextColor: "text-purple-400",
    advice:
      "Health alert: everyone may experience more serious health effects. Avoid outdoor exertion.",
  },
  {
    range: [301, 500],
    label: "Hazardous",
    color: "#7e0023",
    bgColor: "bg-rose-900",
    textColor: "text-rose-700",
    darkTextColor: "text-rose-400",
    advice:
      "Health warnings of emergency conditions. Everyone should avoid all outdoor exertion.",
  },
];

export function getAQICategory(aqi: number) {
  return (
    AQI_CATEGORIES.find((c) => aqi >= c.range[0] && aqi <= c.range[1]) ||
    AQI_CATEGORIES[AQI_CATEGORIES.length - 1]
  );
}

