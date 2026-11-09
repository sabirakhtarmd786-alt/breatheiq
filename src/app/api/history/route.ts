import { NextRequest, NextResponse } from 'next/server';
import { calculatePollutantAQI, getCategoryFromAQI } from '@/lib/aqi/calculator';
import { HistoricalDataPoint, PollutantKey } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '28.6139');
    const lon = parseFloat(searchParams.get('lon') || '77.2090');
    const days = parseInt(searchParams.get('days') || '7', 10);
    const validDays = Math.min(30, Math.max(3, days));

    // Request past days from Open-Meteo Air Quality API
    // past_days gives up to 92 days of authentic historical data
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&past_days=${validDays}&forecast_days=0&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo historical request failed with status ${res.status}`);
    }

    const json = await res.json();
    const hourly = json.hourly;

    if (!hourly || !hourly.time || !Array.isArray(hourly.time)) {
      return NextResponse.json({
        hourly: [],
        daily: [],
        periodComparison: null,
        diurnalCycle: [],
        source: 'Open-Meteo Historical Reanalysis',
        available: false,
      });
    }

    const dataPoints: HistoricalDataPoint[] = [];
    const dailyMap: Record<string, { aqiSum: number; pm2_5Sum: number; pm10Sum: number; no2Sum: number; so2Sum: number; coSum: number; o3Sum: number; maxAqi: number; minAqi: number; count: number }> = {};
    const hourAccumulator: Record<number, { aqiSum: number; pm2_5Sum: number; count: number }> = {};

    for (let h = 0; h < 24; h++) {
      hourAccumulator[h] = { aqiSum: 0, pm2_5Sum: 0, count: 0 };
    }

    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      const pm2_5 = hourly.pm2_5?.[i] ?? 0;
      const pm10 = hourly.pm10?.[i] ?? 0;
      const no2 = hourly.nitrogen_dioxide?.[i] ?? 0;
      const so2 = hourly.sulphur_dioxide?.[i] ?? 0;
      const co = hourly.carbon_monoxide?.[i] ?? 0;
      const o3 = hourly.ozone?.[i] ?? 0;
      
      let aqi = hourly.us_aqi?.[i];
      if (!aqi || isNaN(aqi)) {
        aqi = Math.max(
          calculatePollutantAQI('pm2_5', pm2_5),
          calculatePollutantAQI('pm10', pm10),
          calculatePollutantAQI('no2', no2)
        );
      }

      dataPoints.push({
        time: timeStr,
        pm2_5: Number(pm2_5.toFixed(1)),
        pm10: Number(pm10.toFixed(1)),
        no2: Number(no2.toFixed(1)),
        so2: Number(so2.toFixed(1)),
        co: Number(co.toFixed(1)),
        o3: Number(o3.toFixed(1)),
        aqi: Math.round(aqi),
      });

      // Daily aggregation
      const dateKey = timeStr.slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { aqiSum: 0, pm2_5Sum: 0, pm10Sum: 0, no2Sum: 0, so2Sum: 0, coSum: 0, o3Sum: 0, maxAqi: 0, minAqi: 999, count: 0 };
      }
      dailyMap[dateKey].aqiSum += aqi;
      dailyMap[dateKey].pm2_5Sum += pm2_5;
      dailyMap[dateKey].pm10Sum += pm10;
      dailyMap[dateKey].no2Sum += no2;
      dailyMap[dateKey].so2Sum += so2;
      dailyMap[dateKey].coSum += co;
      dailyMap[dateKey].o3Sum += o3;
      dailyMap[dateKey].maxAqi = Math.max(dailyMap[dateKey].maxAqi, aqi);
      dailyMap[dateKey].minAqi = Math.min(dailyMap[dateKey].minAqi, aqi);
      dailyMap[dateKey].count += 1;

      // Diurnal cycle
      const hour = new Date(timeStr).getHours();
      if (hourAccumulator[hour]) {
        hourAccumulator[hour].aqiSum += aqi;
        hourAccumulator[hour].pm2_5Sum += pm2_5;
        hourAccumulator[hour].count += 1;
      }
    }

    const dailySummary = Object.entries(dailyMap).map(([date, d]) => {
      const avgAqi = Math.round(d.aqiSum / d.count);
      return {
        date,
        avgAqi,
        maxAqi: d.maxAqi,
        minAqi: d.minAqi === 999 ? avgAqi : d.minAqi,
        category: getCategoryFromAQI(avgAqi),
        pm2_5: Number((d.pm2_5Sum / d.count).toFixed(1)),
        pm10: Number((d.pm10Sum / d.count).toFixed(1)),
        no2: Number((d.no2Sum / d.count).toFixed(1)),
        so2: Number((d.so2Sum / d.count).toFixed(1)),
        co: Number((d.coSum / d.count).toFixed(1)),
        o3: Number((d.o3Sum / d.count).toFixed(1)),
      };
    });

    // Diurnal peak hourly stats
    const diurnalCycle = Object.entries(hourAccumulator).map(([hr, h]) => ({
      hour: `${hr.padStart(2, '0')}:00`,
      avgAqi: h.count > 0 ? Math.round(h.aqiSum / h.count) : 0,
      avgPm2_5: h.count > 0 ? Number((h.pm2_5Sum / h.count).toFixed(1)) : 0,
    }));

    // Period-to-period comparison (e.g. recent half vs prior half)
    const midIndex = Math.floor(dataPoints.length / 2);
    const priorPeriod = dataPoints.slice(0, midIndex);
    const recentPeriod = dataPoints.slice(midIndex);

    const calcAvg = (arr: HistoricalDataPoint[], key: 'aqi' | 'pm2_5' | 'pm10') =>
      arr.length > 0 ? arr.reduce((acc, p) => acc + (p[key] ?? 0), 0) / arr.length : 0;

    const recentAqi = calcAvg(recentPeriod, 'aqi');
    const priorAqi = calcAvg(priorPeriod, 'aqi');
    const aqiDeltaPercent = priorAqi > 0 ? Number((((recentAqi - priorAqi) / priorAqi) * 100).toFixed(1)) : 0;

    const recentPm25 = calcAvg(recentPeriod, 'pm2_5');
    const priorPm25 = calcAvg(priorPeriod, 'pm2_5');
    const pm25DeltaPercent = priorPm25 > 0 ? Number((((recentPm25 - priorPm25) / priorPm25) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      hourly: dataPoints,
      daily: dailySummary,
      diurnalCycle,
      periodComparison: {
        recentAqi: Math.round(recentAqi),
        priorAqi: Math.round(priorAqi),
        aqiDeltaPercent,
        recentPm25: Number(recentPm25.toFixed(1)),
        priorPm25: Number(priorPm25.toFixed(1)),
        pm25DeltaPercent,
        trend: aqiDeltaPercent < 0 ? 'improving' : aqiDeltaPercent > 5 ? 'worsening' : 'stable',
      },
      source: 'Open-Meteo European Atmospheric Reanalysis Model (CAMS)',
      timestamp: new Date().toISOString(),
      available: true,
    });
  } catch (error: any) {
    console.error('Error in /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve historical data', details: error.message, available: false },
      { status: 500 }
    );
  }
}
