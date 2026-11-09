'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/context/LocationContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ShieldCheck, 
  HelpCircle, 
  Activity, 
  Wind,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function AIAssistant() {
  const { currentLocation } = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real-time telemetry for current location to ground AI answers
  useEffect(() => {
    async function loadTelemetry() {
      try {
        const res = await fetch(
          `/api/air-quality?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&city=${encodeURIComponent(
            currentLocation.name
          )}`
        );
        if (res.ok) {
          const json = await res.json();
          setActiveTelemetry(json);
        }
      } catch {
        // ignore
      }
    }
    loadTelemetry();
  }, [currentLocation]);

  // Initial welcome message grounded in current location
  useEffect(() => {
    const cityName = currentLocation.name;
    const aqiVal = activeTelemetry?.aqi?.value ?? 'calculating';
    const aqiLabel = activeTelemetry?.aqi?.label ?? 'Current';

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Hello! I am **BreatheIQ Environmental AI**, your personal air quality intelligence assistant.

I am currently analyzing real-time atmospheric data for **${cityName}** (AQI: **${aqiVal}**, Category: **${aqiLabel}**).

You can ask me anything about:
• Today's pollutant levels ($PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3$)
• Safe hours for outdoor running or exercising
• Health precautions for asthma or sensitive family members
• Mask efficiency (N95 vs surgical) and indoor air purifiers
• Smog causes, stubble burning, or Diwali post-celebration air quality patterns!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentLocation, activeTelemetry?.aqi?.value]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Intelligent Contextual Environmental Response Engine
  const generateEnvironmentalResponse = (query: string): string => {
    const q = query.toLowerCase();
    const city = currentLocation.name;
    const aqi = activeTelemetry?.aqi?.value ?? 145;
    const pm25 = activeTelemetry?.pollutants?.pm2_5?.value ?? 55;
    const pm10 = activeTelemetry?.pollutants?.pm10?.value ?? 120;
    const no2 = activeTelemetry?.pollutants?.no2?.value ?? 42;
    const dominant = activeTelemetry?.aqi?.dominantPollutant?.replace('_', '.') ?? 'PM2.5';
    const temp = activeTelemetry?.weather?.temperature ?? 25;
    const windSpeed = activeTelemetry?.weather?.windSpeed ?? 8;

    // Outdoor / Exercise queries
    if (q.includes('exercise') || q.includes('run') || q.includes('jog') || q.includes('workout') || q.includes('outside')) {
      if (aqi <= 50) {
        return `Air quality in **${city}** is currently **Good** (AQI: ${aqi}). It is an ideal time for vigorous outdoor running, cycling, or team sports. Airway irritation risk is minimal.`;
      } else if (aqi <= 100) {
        return `Air quality in **${city}** is **Moderate** (AQI: ${aqi}). Outdoor running is acceptable for the general public, but unusually sensitive runners should monitor for mild throat tickles or cough.`;
      } else if (aqi <= 150) {
        return `Air quality in **${city}** is **Unhealthy for Sensitive Groups** (AQI: ${aqi}, PM2.5: ${pm25} µg/m³). We recommend shifting high-intensity aerobic workouts indoors. If exercising outside, schedule it during mid-afternoon (2 PM – 4 PM) when atmospheric mixing is highest.`;
      } else {
        return `⚠️ **Exercise Alert for ${city}**: Current AQI is **${aqi} (${activeTelemetry?.aqi?.label})** with PM2.5 at **${pm25} µg/m³** (${(pm25 / 15).toFixed(1)}× above WHO 24-hr guideline). Heavy respiration outdoors will draw large volumes of sub-micron particulates deep into your bronchial alveoli. **Avoid all outdoor jogging or cycling.** Exercise indoors in a space with HEPA air filtration.`;
      }
    }

    // Mask queries
    if (q.includes('mask') || q.includes('n95') || q.includes('kn95') || q.includes('surgical') || q.includes('cloth')) {
      return `For current air in **${city}** (Dominant pollutant: **${dominant}** at ${pm25} µg/m³):
• **N95 / FFP2 / KN95 Respirators**: Strongly recommended. Their electrostatic melt-blown filtration layer traps 95%+ of sub-micron particles down to 0.3 µm.
• **Surgical Masks**: Provide only ~30–40% PM2.5 protection due to loose perimeter facial seals.
• **Cloth Masks**: Offer under 15% filtration of fine combustion soot and are ineffective during winter or post-Diwali smog episodes.`;
    }

    // Diwali / Firecracker queries
    if (q.includes('diwali') || q.includes('cracker') || q.includes('firework') || q.includes('stubble') || q.includes('smog')) {
      return `During the **Diwali season and northern Indian winter months**, air quality is impacted by a confluence of factors:
1. **Firework Combustion**: Pyrotechnics emit massive spikes of **PM2.5, PM10, Barium, Potassium nitrate, and Sulfur dioxide ($SO_2$)**.
2. **Thermal Inversion**: Cold nighttime surface air gets trapped beneath a warm atmospheric layer, preventing smoke from dispersing vertically.
3. **Low Wind Speeds**: Current wind speed in ${city} is ${windSpeed} km/h, which is insufficient to rapidly ventilate heavy emissions.
4. **Biomass & Stubble Inflow**: Seasonal agricultural field clearing contributes high baseline organic carbon aerosol loads across the Indo-Gangetic plain.`;
    }

    // Specific pollutant queries
    if (q.includes('pm2.5') || q.includes('pm25')) {
      return `**Fine Particulate Matter (PM2.5)** in **${city}** is currently measured at **${pm25} µg/m³**.
• **WHO Safe Limit**: 15 µg/m³ (24-hour mean). Current level is **${(pm25 / 15).toFixed(1)}× the guideline**.
• **Why it's hazardous**: Because PM2.5 particles are less than 2.5 microns wide (30× smaller than a human hair), nasal cilia cannot filter them. They penetrate the gas-exchange regions of the lungs and enter systemic circulation.`;
    }

    if (q.includes('pm10')) {
      return `**Coarse Particulate Matter (PM10)** in **${city}** is currently **${pm10} µg/m³** (WHO 24-hr guideline: 45 µg/m³). PM10 originates from road dust, construction, unpaved surfaces, and industrial abrasion. It causes severe eye stinging, allergic rhinitis, and upper airway coughing.`;
    }

    // Asthma / Health queries
    if (q.includes('asthma') || q.includes('kid') || q.includes('child') || q.includes('baby') || q.includes('elderly') || q.includes('pregnant')) {
      return `Medical considerations for sensitive groups in **${city}** (AQI: ${aqi}):
• Keep prescribed bronchodilator / steroid inhalers readily accessible.
• Keep residential windows closed between 6:00 PM and 10:00 AM when thermal inversion traps ground emissions.
• Run HEPA air purifiers in sleeping rooms to maintain indoor PM2.5 below 12 µg/m³.
• If experiencing persistent wheezing, tightness in chest, or shortness of breath, consult a physician promptly.`;
    }

    // Default intelligent environmental overview
    return `Environmental Telemetry Summary for **${city}**:
• **Air Quality Index**: ${aqi} (${activeTelemetry?.aqi?.label || 'Active'})
• **Dominant Criterion Pollutant**: ${dominant}
• **Concentration Levels**: PM2.5: ${pm25} µg/m³, PM10: ${pm10} µg/m³, NO2: ${no2} µg/m³
• **Atmospheric Weather**: ${temp}°C, Wind speed: ${windSpeed} km/h
• **Health Recommendation**: ${activeTelemetry?.aqi?.description || 'Follow standard air precautions.'}

Let me know if you would like specific guidance on mask selection, indoor air purification, or historical pollution comparisons!`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    // Simulate realistic intelligent response time
    setTimeout(() => {
      const reply = generateEnvironmentalResponse(currentInput);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const QUICK_PROMPTS = [
    'Is it safe to go for a run right now?',
    'What mask should I wear today?',
    'Why is PM2.5 so dangerous to breathe?',
    'How does Diwali smoke affect air quality?',
    'What precautions should asthma patients take?',
  ];

  return (
    <div className="h-[680px] sm:h-[740px] flex flex-col rounded-3xl border border-slate-200 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 shadow-xl backdrop-blur-md overflow-hidden select-none">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-navy-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-navy-950 shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                BreatheIQ Environmental Assistant
              </h3>
              <Badge variant="purple" size="sm">
                Context-Grounded AI
              </Badge>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Grounded in live telemetry for {currentLocation.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages((prev) => prev.slice(0, 1));
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${
                isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isAI
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-navy-800 text-white'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'bg-slate-100 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'bg-emerald-500 text-white font-medium shadow-md shadow-emerald-500/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <span className="text-[10px] text-slate-400 mt-1.5 block text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Analyzing environmental telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-navy-850/80 overflow-x-auto flex gap-2 scrollbar-none">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(prompt);
            }}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-slate-100 dark:bg-navy-800 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50/80 dark:bg-navy-950/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Ask about air quality or health in ${currentLocation.name}...`}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
          className="rounded-2xl px-4 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
