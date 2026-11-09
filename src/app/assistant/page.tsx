"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Card } from "@/components/ui/Card";
import { Bot, Send, User, Loader2, Info } from "lucide-react";
import { POLLUTANTS, AQI_CATEGORIES } from "@/lib/constants/aqi";
import type { AirQualityData } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Rule-based insight system (no paid AI required)
function generateInsight(query: string, data: AirQualityData | null): string {
  const q = query.toLowerCase();
  const aqi = data?.aqi;
  const measurements = data?.measurements;
  const location = data?.location?.name || "the selected location";

  if (!data) {
    return "I don't have air quality data loaded yet. Please wait for the data to load on the Overview page, then ask your question.";
  }

  // AQI questions
  if (q.includes("aqi") || q.includes("air quality index")) {
    if (!aqi?.calculated) return `I couldn't calculate an AQI for ${location} because there isn't sufficient pollutant data available. This can happen in areas with limited monitoring coverage.`;
    const cat = AQI_CATEGORIES.find((c) => aqi.value >= c.range[0] && aqi.value <= c.range[1]);
    return `The current AQI for ${location} is **${aqi.value}** (${aqi.category}), calculated using the US-EPA standard. ${cat?.advice || ""} The dominant pollutant is ${aqi.dominantPollutant ? POLLUTANTS[aqi.dominantPollutant as keyof typeof POLLUTANTS]?.fullName : "unknown"}.`;
  }

  // PM2.5
  if (q.includes("pm2.5") || q.includes("pm25") || q.includes("fine particle")) {
    const pm25 = measurements?.pm25;
    if (!pm25) return `I don't have PM2.5 data for ${location}. PM2.5 is fine particulate matter smaller than 2.5 micrometers — one of the most health-significant pollutants because it penetrates deep into lung tissue.`;
    const level = pm25.value < 15 ? "good (WHO guideline is 15 µg/m³)" : pm25.value < 35 ? "moderate" : pm25.value < 55 ? "high" : "very high";
    return `PM2.5 at ${location} is currently **${pm25.value.toFixed(1)} µg/m³** — considered ${level}. PM2.5 is fine particulate matter that can penetrate deep into lungs and the bloodstream. WHO's annual guideline is 5 µg/m³ and 24-hour guideline is 15 µg/m³.`;
  }

  // NO2
  if (q.includes("no2") || q.includes("nitrogen")) {
    const no2 = measurements?.no2;
    if (!no2) return `No NO₂ data is available for ${location}. Nitrogen dioxide comes primarily from vehicle emissions and power plants, irritating airways and contributing to smog formation.`;
    return `NO₂ at ${location} is **${no2.value.toFixed(1)} µg/m³**. Nitrogen dioxide primarily comes from vehicle exhaust and industrial combustion. The WHO 24-hour guideline is 25 µg/m³, and the annual guideline is 10 µg/m³.`;
  }

  // O3 / ozone
  if (q.includes("ozone") || q.includes("o3")) {
    const o3 = measurements?.o3;
    if (!o3) return `No ground-level ozone (O₃) data is available for ${location}. Ground-level ozone forms when sunlight reacts with NOx and VOCs — unlike the stratospheric ozone layer which protects us, ground-level ozone is harmful to breathe.`;
    return `Ozone (O₃) at ${location} is **${o3.value.toFixed(1)} µg/m³**. Ground-level ozone forms through chemical reactions in sunlight. It irritates the respiratory system and can worsen asthma and other lung conditions.`;
  }

  // Health questions
  if (q.includes("safe") || q.includes("health") || q.includes("exercise") || q.includes("outdoor")) {
    if (!aqi?.calculated) return `Without a calculated AQI for ${location}, I can't give specific activity guidance. Generally, check local monitoring stations and reduce outdoor activity when pollution is high.`;
    if (aqi.value <= 50) return `With an AQI of ${aqi.value} at ${location}, outdoor conditions are generally safe for most people. Enjoy outdoor activities!`;
    if (aqi.value <= 100) return `With an AQI of ${aqi.value} at ${location}, conditions are moderate. Most people can go outside normally. Sensitive individuals (asthma, heart disease) should consider limiting prolonged vigorous exercise outdoors.`;
    if (aqi.value <= 150) return `With an AQI of ${aqi.value} at ${location}, the air is Unhealthy for Sensitive Groups. Children, elderly, and people with respiratory or cardiovascular conditions should limit prolonged outdoor exertion. The general public can still be active outdoors but should take breaks.`;
    return `With an AQI of ${aqi.value} at ${location}, conditions are ${aqi.category}. Everyone should reduce outdoor exertion. Wear an N95 or similar mask if you must go outside. Keep windows closed and use air purifiers if available. This is especially important for sensitive groups.`;
  }

  // Comparison questions
  if (q.includes("compare") || q.includes("comparison") || q.includes("better")) {
    return `Use the **Location Comparison** page to compare air quality between multiple cities side by side. It shows pollutant readings, AQI values, and a radar chart to help you identify which location has relatively cleaner air based on available measurements.`;
  }

  // Forecast questions
  if (q.includes("forecast") || q.includes("tomorrow") || q.includes("next")) {
    return `Visit the **Forecast** page to see a 5-day model-based air quality forecast powered by Open-Meteo. The forecast shows predicted PM2.5, PM10, NO₂, and ozone levels. Remember: forecasts are model predictions, not measured values.`;
  }

  // General / fallback
  return `I'm BreatheIQ's built-in Air Quality Assistant. I can help you understand:
  
• **Current AQI** — ask "What is the AQI?"
• **Specific pollutants** — ask "What is PM2.5?" or "Tell me about NO2"
• **Health guidance** — ask "Is it safe to exercise outside?"
• **Health effects** — ask about any pollutant's health impact
• **Feature guidance** — ask about forecasts, comparisons, or maps

I use real data from the OpenAQ and Open-Meteo APIs as my context. What would you like to know?`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm the BreatheIQ Air Quality Assistant. I can explain pollutants, interpret AQI values, provide health guidance, and help you use the platform. Ask me anything about air quality!\n\n*(Note: I use a rule-based system with real API data as context. I won't invent readings or make medical diagnoses.)*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [airData, setAirData] = useState<AirQualityData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load current air data for context
    fetch("/api/air-quality?lat=28.6139&lon=77.209")
      .then((r) => r.json())
      .then((json) => setAirData(json.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    // Simulate a small delay for natural feel
    await new Promise((r) => setTimeout(r, 600));
    const response = generateInsight(userMsg, airData);
    setMessages((m) => [...m, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const SUGGESTIONS = [
    "What is the current AQI?",
    "Tell me about PM2.5",
    "Is it safe to exercise outside?",
    "What causes NO2 pollution?",
    "What is ground-level ozone?",
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4 fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            AI Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-1">Rule-based air quality insights using real API data</p>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            This assistant uses a transparent rule-based system with actual air quality data as context. It does not invent readings, make medical diagnoses, or provide personalized medical advice.
          </p>
        </div>

        {/* Chat window */}
        <Card noPad className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                }`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "assistant"
                    ? "bg-slate-700/60 text-slate-200"
                    : "bg-emerald-500/20 text-emerald-100"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-slate-700/60 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about air quality, pollutants, or health…"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
              />
              <button onClick={send} disabled={!input.trim() || loading}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Suggestions */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setInput(s); }}
                className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

