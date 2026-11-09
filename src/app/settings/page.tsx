"use client";

import { AppShell } from "@/components/navigation/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Database, Info, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Configure BreatheIQ preferences</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-xl">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-slate-300" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              <div>
                <p className="text-sm font-medium text-slate-200">{theme === "dark" ? "Dark" : "Light"} Mode</p>
                <p className="text-xs text-slate-500">Toggle between dark and light themes</p>
              </div>
            </div>
            <button onClick={toggle}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-slate-600" : "bg-emerald-500"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === "dark" ? "left-0.5" : "left-6"}`} />
            </button>
          </div>
        </Card>

        {/* Data sources */}
        <Card>
          <CardHeader><CardTitle>Data Sources</CardTitle></CardHeader>
          <div className="space-y-3">
            {[
              {
                name: "OpenAQ v3",
                desc: "Real-time ground monitoring station data. Requires OPENAQ_API_KEY in .env.local.",
                url: "https://openaq.org",
                type: "Ground measurements",
                color: "#10b981",
              },
              {
                name: "Open-Meteo Air Quality API",
                desc: "Model-based air quality estimates and 5-day forecasts. No API key required.",
                url: "https://open-meteo.com",
                type: "Model forecast",
                color: "#3b82f6",
              },
              {
                name: "OpenStreetMap / Nominatim",
                desc: "Geocoding and map tiles. Free and open-source.",
                url: "https://openstreetmap.org",
                type: "Maps & Geocoding",
                color: "#6366f1",
              },
            ].map((source) => (
              <div key={source.name} className="p-4 bg-slate-700/40 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="font-medium text-sm text-slate-200">{source.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md text-slate-400 bg-slate-700">
                        {source.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-4">{source.desc}</p>
                  </div>
                  <a href={source.url} target="_blank" rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Environment variables */}
        <Card>
          <CardHeader><CardTitle>API Configuration</CardTitle></CardHeader>
          <div className="p-4 bg-slate-700/40 rounded-xl">
            <p className="text-sm text-slate-300 mb-2 font-medium">Required for live ground-station data:</p>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400">
              OPENAQ_API_KEY=your_key_here
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Add this to <code className="text-slate-300">.env.local</code> in your project root. Get a free API key at{" "}
              <a href="https://explore.openaq.org/register" target="_blank" rel="noreferrer"
                className="text-blue-400 hover:underline">openaq.org</a>.
            </p>
          </div>
          <div className="p-4 bg-slate-700/40 rounded-xl mt-3">
            <p className="text-sm text-slate-300 mb-1 font-medium">Optional for Gemini AI features:</p>
            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400">
              GEMINI_API_KEY=your_key_here
            </div>
            <p className="text-xs text-slate-500 mt-2">
              The AI Assistant works without this key using a rule-based system. With a Gemini API key, it can be upgraded to full AI responses.
            </p>
          </div>
        </Card>

        {/* About */}
        <Card>
          <CardHeader><CardTitle>About BreatheIQ</CardTitle></CardHeader>
          <div className="space-y-2 text-sm text-slate-400">
            <p><strong className="text-slate-200">Version:</strong> 1.0.0</p>
            <p><strong className="text-slate-200">Challenge:</strong> Let's Code Diwali Challenge 2026</p>
            <p><strong className="text-slate-200">Theme:</strong> Technology for Cleaner Air</p>
            <p><strong className="text-slate-200">AQI Standard:</strong> US-EPA (2018 Technical Assistance Document)</p>
            <p><strong className="text-slate-200">Stack:</strong> Next.js 15, React, TypeScript, Tailwind CSS, Recharts, React Leaflet</p>
          </div>
          <div className="mt-4 p-3 bg-slate-700/40 rounded-xl text-xs text-slate-500">
            <strong className="text-slate-400">Data Disclaimer:</strong> BreatheIQ uses authentic public APIs for real data. Where API data is unavailable, clearly labeled demo data is shown. AQI values are calculated per the US-EPA standard and require sufficient valid pollutant measurements. This platform is for general informational purposes only — not medical advice.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

