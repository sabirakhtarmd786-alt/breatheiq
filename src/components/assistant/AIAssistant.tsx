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
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: string;
}

const QUICK_PROMPTS = [
  'Tell me about BreatheIQ & its architecture',
  'Which authentic public APIs are integrated?',
  'Which mandatory and bonus features are implemented?',
  'Compare CPCB vs US EPA AQI formulas',
  'Calculate cigarette equivalence for current air',
  'Why does Diwali & winter pollution spike?',
  'Which face masks filter PM2.5 effectively?',
  'Is it safe to exercise outdoors right now?',
];

export function AIAssistant() {
  const { currentLocation } = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
    const aqiVal = activeTelemetry?.aqi?.value ?? '--';
    const aqiLabel = activeTelemetry?.aqi?.label ?? 'Active';

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `### 🌿 Welcome to BreatheIQ AI Assistant!

I am your **Environmental Intelligence & Air Quality Science Assistant**, grounded in live telemetry for **${cityName}** (AQI: **${aqiVal}**, Category: **${aqiLabel}**).

You can ask me about:
- **Project & Architecture**: Tech stack, authentic public APIs, competition challenge details, and data engineering.
- **Environmental Science**: CPCB vs US EPA AQI formulas, PM2.5 alveolar penetration, WHO guidelines, and Berkeley Earth cigarette math.
- **Diwali Smog & Meteorology**: Thermal inversion dynamics, stubble burning aerosols, and firecracker chemical constituents.
- **Health Advisories**: Safe exercise windows, certified N95 respirators, True HEPA purifiers, and asthma mitigation.

*Feel free to type or tap the microphone for voice input!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'BreatheIQ Expert AI Engine',
      },
    ]);
  }, [currentLocation, activeTelemetry?.aqi?.value]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice Assistant: Web Speech API Speech-to-Text
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessageWithText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Voice Assistant: Text-to-Speech Playback
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/•/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  const handleSendMessageWithText = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: activeTelemetry || {
            location: currentLocation,
          },
        }),
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const aiResponse = data.response;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'BreatheIQ Knowledge Engine',
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiResponse);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I am currently analyzing live atmospheric data for ${currentLocation.name}. Please ask any question about project architecture, CPCB vs US EPA formulas, health advisories, or mask efficacy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    handleSendMessageWithText(inputText);
  };

  return (
    <div className="flex flex-col h-[650px] sm:h-[720px] rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-navy-800 bg-slate-50/90 dark:bg-navy-950/90 flex items-center justify-between gap-3">
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
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grounded in live telemetry for {currentLocation.name} • Public Access
            </span>
          </div>
        </div>

        {/* Top Control Buttons: Voice Toggle & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsSpeakingEnabled(!isSpeakingEnabled);
              if (isSpeakingEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-xl transition-all ${
              isSpeakingEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
            title={isSpeakingEnabled ? 'Voice Playback Active (Click to Mute)' : 'Enable Voice Playback'}
          >
            {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setMessages((prev) => prev.slice(0, 1));
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
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
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'bg-slate-100 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'bg-emerald-500 text-white font-medium shadow-md shadow-emerald-500/20'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-1.5">{m.text}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-200/50 dark:border-navy-800/60">
                  <span>{m.source ? `✓ ${m.source}` : 'User Inquiry'}</span>
                  <span>{m.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 animate-pulse">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Consulting environmental knowledge base & real-time telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-navy-850/80 overflow-x-auto flex gap-2 scrollbar-none bg-slate-50/50 dark:bg-navy-950/40">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(prompt);
              handleSendMessageWithText(prompt);
            }}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-white dark:bg-navy-800 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50/80 dark:bg-navy-950/80 flex items-center gap-2">
        {/* Voice Input Microphone Button */}
        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-2xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40'
          }`}
          title={isListening ? 'Listening... Click to stop' : 'Voice Input (Speak your question)'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

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
          placeholder={`Ask about BreatheIQ architecture, APIs, or air quality in ${currentLocation.name}...`}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        
        <Button
          variant="primary"
          size="md"
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
          className="rounded-2xl px-4 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
