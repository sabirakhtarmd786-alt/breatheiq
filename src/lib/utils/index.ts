// ============================================================
// BreatheIQ — Utility helpers
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(iso: string): string {
  try {
    const date = parseISO(iso);
    if (!isValid(date)) return "Unknown time";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Unknown time";
  }
}

export function formatDate(iso: string): string {
  try {
    const date = parseISO(iso);
    if (!isValid(date)) return iso;
    return format(date, "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    const date = parseISO(iso);
    if (!isValid(date)) return iso;
    return format(date, "MMM d");
  } catch {
    return iso;
  }
}

export function formatHour(iso: string): string {
  try {
    const date = parseISO(iso);
    if (!isValid(date)) return iso;
    return format(date, "ha");
  } catch {
    return iso;
  }
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getWindDescription(speed: number): string {
  if (speed < 1) return "Calm";
  if (speed < 6) return "Light";
  if (speed < 12) return "Gentle";
  if (speed < 20) return "Moderate";
  if (speed < 29) return "Fresh";
  return "Strong";
}

