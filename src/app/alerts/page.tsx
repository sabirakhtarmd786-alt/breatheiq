"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Bell, Plus, Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { POLLUTANTS } from "@/lib/constants/aqi";
import type { PollutantKey, Alert } from "@/types";

const DEFAULT_THRESHOLDS: Record<string, { value: number; label: string }> = {
  pm2_5: { value: 35, label: "WHO 24h guideline" },
  pm25: { value: 35, label: "WHO 24h guideline" },
  pm10: { value: 100, label: "WHO 24h guideline" },
  no2: { value: 200, label: "WHO 1h guideline" },
  so2: { value: 500, label: "WHO 10-min guideline" },
  co: { value: 10, label: "Moderate" },
  o3: { value: 160, label: "WHO 8h guideline" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [addPollutant, setAddPollutant] = useState<PollutantKey>("pm2_5");
  const [addThreshold, setAddThreshold] = useState(35);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("breatheiq-alerts");
      if (stored) setAlerts(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (newAlerts: Alert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem("breatheiq-alerts", JSON.stringify(newAlerts));
  };

  const addAlert = () => {
    const info = POLLUTANTS[addPollutant];
    const newAlert: Alert = {
      id: Date.now().toString(),
      pollutant: addPollutant,
      threshold: addThreshold,
      unit: info.unit,
      enabled: true,
    };
    save([...alerts, newAlert]);
  };

  const toggleAlert = (id: string) => {
    save(alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const deleteAlert = (id: string) => {
    save(alerts.filter((a) => a.id !== id));
  };

  const POLLUTANT_KEYS: PollutantKey[] = ["pm2_5", "pm10", "no2", "so2", "co", "o3"];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            Smart AQI Alerts
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure pollutant thresholds for in-app alerts</p>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            Alerts are checked when you view the Overview page. This is in-app notification only — not continuous background monitoring. Alerts are stored locally in your browser.
          </p>
        </div>

        {/* Add alert */}
        <Card>
          <CardHeader><CardTitle>Add New Alert</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Pollutant</label>
              <select
                value={addPollutant}
                onChange={(e) => {
                  const p = e.target.value as PollutantKey;
                  setAddPollutant(p);
                  setAddThreshold(DEFAULT_THRESHOLDS[p]?.value ?? 35);
                }}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              >
                {POLLUTANT_KEYS.map((p) => (
                  <option key={p} value={p}>{POLLUTANTS[p].name} — {POLLUTANTS[p].fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Threshold ({POLLUTANTS[addPollutant].unit})
              </label>
              <input
                type="number"
                value={addThreshold}
                onChange={(e) => setAddThreshold(parseFloat(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none w-28"
              />
            </div>
            <div className="text-xs text-slate-500 pb-2">
              Reference: {DEFAULT_THRESHOLDS[addPollutant]?.label || "Advisory threshold"}
            </div>
            <button onClick={addAlert}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition-colors ml-auto">
              <Plus className="w-4 h-4" />
              Add Alert
            </button>
          </div>
        </Card>

        {/* Alert list */}
        {alerts.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No alerts configured yet</p>
            <p className="text-xs text-slate-500 mt-1">Add an alert above to get started</p>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-200">Your Alerts ({alerts.length})</h2>
            {alerts.map((alert) => {
              const info = (POLLUTANTS as Record<string, any>)[alert.pollutant] || POLLUTANTS.pm2_5;
              return (
                <Card key={alert.id} className={`p-4 ${!alert.enabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${alert.enabled ? "bg-emerald-500" : "bg-slate-600"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{info.name}</span>
                        <span className="text-xs text-slate-500">— {info.fullName}</span>
                        {alert.triggeredAt && <span className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Triggered</span>}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Alert when {info.name} &gt; <strong className="text-slate-200">{alert.threshold} {info.unit}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAlert(alert.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          alert.enabled
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-400 border border-slate-600"
                        }`}>
                        {alert.enabled ? "Enabled" : "Disabled"}
                      </button>
                      <button onClick={() => deleteAlert(alert.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Reference thresholds */}
        <Card>
          <CardHeader><CardTitle>Reference Thresholds</CardTitle><span className="text-xs text-slate-500">WHO & EPA guidelines</span></CardHeader>
          <div className="space-y-2">
            {POLLUTANT_KEYS.map((p) => (
              <div key={p} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-slate-200">{POLLUTANTS[p].name}</span>
                  <span className="text-xs text-slate-500 ml-2">{POLLUTANTS[p].fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-300">{DEFAULT_THRESHOLDS[p]?.value ?? 35} {POLLUTANTS[p]?.unit}</span>
                  <p className="text-xs text-slate-500">{DEFAULT_THRESHOLDS[p]?.label || ""}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

