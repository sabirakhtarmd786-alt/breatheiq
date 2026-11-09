import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '--';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatHour(timeStr: string): string {
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  } catch {
    return timeStr;
  }
}

export function formatTimestamp(timestampStr?: string | Date): string {
  if (!timestampStr) return 'Recently';
  try {
    const d = typeof timestampStr === 'string' ? new Date(timestampStr) : timestampStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(timestampStr);
  }
}

export function formatTimeAgo(timestampStr: string): string {
  try {
    const date = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

export function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAQICategoryColor(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('good')) return '#10B981';
  if (cat.includes('moderate')) return '#F59E0B';
  if (cat.includes('sensitive')) return '#F97316';
  if (cat.includes('very')) return '#A855F7';
  if (cat.includes('unhealthy')) return '#EF4444';
  if (cat.includes('hazard')) return '#881337';
  return '#94A3B8';
}

export function getAQISeverityDetails(aqi: number) {
  if (aqi <= 50) {
    return {
      category: 'good' as const,
      label: 'Good',
      hex: '#10B981',
      bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      badgeClass: 'bg-emerald-500 text-white',
      advisory: 'Air quality is satisfactory and poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'moderate' as const,
      label: 'Moderate',
      hex: '#F59E0B',
      bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      badgeClass: 'bg-amber-500 text-white',
      advisory: 'Air quality is acceptable; unusually sensitive individuals should consider limiting prolonged outdoor exertion.',
    };
  }
  if (aqi <= 150) {
    return {
      category: 'sensitive' as const,
      label: 'Unhealthy for Sensitive Groups',
      hex: '#F97316',
      bgClass: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      badgeClass: 'bg-orange-500 text-white',
      advisory: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'unhealthy' as const,
      label: 'Unhealthy',
      hex: '#EF4444',
      bgClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      badgeClass: 'bg-rose-500 text-white',
      advisory: 'Everyone may begin to experience health effects. Sensitive groups should avoid outdoor physical exertion.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'veryUnhealthy' as const,
      label: 'Very Unhealthy',
      hex: '#A855F7',
      bgClass: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      badgeClass: 'bg-purple-500 text-white',
      advisory: 'Health alert: The risk of health effects is substantially increased for everyone. Avoid outdoor activity.',
    };
  }
  return {
    category: 'hazardous' as const,
    label: 'Hazardous',
    hex: '#881337',
    bgClass: 'bg-red-950/40 border-red-800/40 text-red-300',
    badgeClass: 'bg-red-900 text-white',
    advisory: 'Health warning of emergency conditions. The entire population is likely to be affected. Stay indoors!',
  };
}
