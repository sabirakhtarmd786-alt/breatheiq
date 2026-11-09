'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Plus, 
  Sliders, 
  Volume2, 
  Sparkles,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InAppAlert } from '@/types';

interface AlertRule {
  id: string;
  metric: 'aqi' | 'pm2_5' | 'pm10' | 'no2';
  label: string;
  threshold: number;
  unit: string;
  enabled: boolean;
}

export function SmartAlerts() {
  const { currentLocation } = useLocation();

  const [rules, setRules] = useState<AlertRule[]>([
    { id: 'rule-aqi', metric: 'aqi', label: 'Overall AQI Severity', threshold: 150, unit: 'AQI', enabled: true },
    { id: 'rule-pm25', metric: 'pm2_5', label: 'Fine Particles (PM2.5)', threshold: 60, unit: 'µg/m³', enabled: true },
    { id: 'rule-pm10', metric: 'pm10', label: 'Coarse Dust (PM10)', threshold: 150, unit: 'µg/m³', enabled: false },
    { id: 'rule-no2', metric: 'no2', label: 'Nitrogen Dioxide (NO2)', threshold: 80, unit: 'µg/m³', enabled: false },
  ]);

  const [alerts, setAlerts] = useState<InAppAlert[]>([
    {
      id: 'al-1',
      timestamp: '18 mins ago',
      title: 'High Particulate Surge in New Delhi',
      message: 'PM2.5 concentrations reached 132.7 µg/m³ exceeding your 60 µg/m³ threshold. Sensitive groups should wear N95 respirators.',
      severity: 'critical',
      read: false,
      pollutant: 'PM2.5',
      value: 132.7,
      threshold: 60,
    },
    {
      id: 'al-2',
      timestamp: '2 hours ago',
      title: 'Nocturnal Thermal Inversion Warning',
      message: 'Low surface wind (7.5 km/h) combined with high relative humidity is trapping combustion smoke near ground level.',
      severity: 'warning',
      read: true,
    },
    {
      id: 'al-3',
      timestamp: 'Yesterday',
      title: 'Safe Running Window Cleared',
      message: 'Air quality temporarily improved to Moderate (AQI 82) following afternoon convective mixing.',
      severity: 'info',
      read: true,
    },
  ]);

  const [browserPerm, setBrowserPerm] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const p = await Notification.requestPermission();
      setBrowserPerm(p);
      if (p === 'granted') {
        new Notification('BreatheIQ Smart Alerts Active', {
          body: `Real-time pollution threshold monitoring enabled for ${currentLocation.name}.`,
        });
      }
    }
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdateThreshold = (id: string, newThresh: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, threshold: newThresh } : r))
    );
  };

  const handleTriggerTestAlert = () => {
    const newAlert: InAppAlert = {
      id: `al-${Date.now()}`,
      timestamp: 'Just now',
      title: `Simulated Alert for ${currentLocation.name}`,
      message: `Demonstration alert: Configured threshold crossed. Real-time air quality index reached 175.`,
      severity: 'warning',
      read: false,
      pollutant: 'AQI',
      value: 175,
      threshold: 150,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    if (browserPerm === 'granted') {
      new Notification('BreatheIQ Alert Triggered', {
        body: newAlert.message,
      });
    }
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Smart AQI Alerts & Threshold Monitoring
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set custom air quality limits and receive in-app notifications whenever ambient pollution exceeds your safety thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {browserPerm !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestBrowserPermission}
              className="text-xs gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Enable Browser Push
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerTestAlert}
            className="text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Alert
          </Button>
        </div>
      </div>

      {/* Threshold Configuration Rules */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Configured Pollutant Alert Thresholds
          </CardTitle>
          <CardDescription>
            BreatheIQ evaluates incoming sensor feeds against these parameters.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition-all ${
                rule.enabled
                  ? 'bg-slate-50 dark:bg-navy-850 border-slate-200 dark:border-navy-700'
                  : 'bg-slate-50/50 dark:bg-navy-900/50 border-slate-200/50 dark:border-navy-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {rule.label}
                </span>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trigger Threshold:</span>
                  <span className="font-bold text-emerald-400">
                    &gt; {rule.threshold} {rule.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={rule.metric === 'aqi' ? 50 : 15}
                  max={rule.metric === 'aqi' ? 300 : 250}
                  step={5}
                  value={rule.threshold}
                  onChange={(e) => handleUpdateThreshold(rule.id, parseInt(e.target.value, 10))}
                  disabled={!rule.enabled}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active In-App Notifications Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-base sm:text-lg">
              Notification Center & Alert History
            </CardTitle>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((al) => (
              <div
                key={al.id}
                className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
                  al.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : al.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-100 dark:bg-navy-850 border-slate-200 dark:border-navy-700 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {al.severity === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {al.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{al.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {al.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No active alerts recorded. All environmental metrics are currently within configured bounds.
          </div>
        )}
      </Card>
    </div>
  );
}
