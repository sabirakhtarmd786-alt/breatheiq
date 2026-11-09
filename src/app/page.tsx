'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';
import { MapWrapper } from '@/components/maps/MapWrapper';
import { HistoricalTracker } from '@/components/charts/HistoricalTracker';
import { LocationComparison } from '@/components/comparison/LocationComparison';
import { CleanAirFinder } from '@/components/comparison/CleanAirFinder';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { ForecastView } from '@/components/forecast/ForecastView';
import { AIAssistant } from '@/components/assistant/AIAssistant';
import { SmartAlerts } from '@/components/alerts/SmartAlerts';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import { NavigationTab } from '@/types';
import { 
  Wind, 
  MapPin, 
  LineChart, 
  GitCompare, 
  HeartPulse, 
  CloudSun, 
  Compass, 
  Sparkles, 
  Bell, 
  Settings,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Global Search and Theme Switcher */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenNotifications={() => setActiveTab('alerts')}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: Live AQI Dashboard */}
          {activeTab === 'overview' && (
            <LiveDashboard
              onNavigateToMap={() => setActiveTab('map')}
              onNavigateToHealth={() => setActiveTab('health')}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
            />
          )}

          {/* TAB 2: Interactive Air Quality Map (India State -> City -> Station Drilldown) */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-emerald-400" />
                    Interactive Air Quality Map of India
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    State Choropleth: All Indian states divided by official AQI severity colors &rarr; Click any state to drill down into cities &rarr; Zoom further for precision ground stations.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="success" size="md">
                    Choropleth Active
                  </Badge>
                  <Badge variant="info" size="md">
                    100% Free • No API Key Needed
                  </Badge>
                </div>
              </div>

              {/* Dynamic Map Component */}
              <MapWrapper />
            </div>
          )}

          {/* TAB 3: Historical Analytics */}
          {activeTab === 'analytics' && (
            <HistoricalTracker />
          )}

          {/* TAB 4: Location Comparison */}
          {activeTab === 'comparison' && (
            <LocationComparison />
          )}

          {/* TAB 5: Health & Safety Dashboard */}
          {activeTab === 'health' && (
            <HealthDashboard />
          )}

          {/* TAB 6: Air Quality Forecast */}
          {activeTab === 'forecast' && (
            <ForecastView />
          )}

          {/* TAB 7: Clean Air Finder */}
          {activeTab === 'clean-air' && (
            <CleanAirFinder />
          )}

          {/* TAB 8: AI Assistant */}
          {activeTab === 'assistant' && (
            <AIAssistant />
          )}

          {/* TAB 9: Smart Alerts */}
          {activeTab === 'alerts' && (
            <SmartAlerts />
          )}

          {/* TAB 10: Settings & Diagnostics */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-emerald-400" />
                  Platform Settings & API Diagnostics
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Configure calculation standards, verify authentic public data connections, and access challenge credentials.
                </p>
              </div>

              {/* Data Standards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Air Quality Standards & Formulation</CardTitle>
                  <CardDescription>BreatheIQ rigorously adheres to documented environmental protection agency formulas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Selected Standard: United States EPA (40 CFR Part 58)
                      </span>
                      <Badge variant="success">Primary</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Computes sub-indices using piecewise linear interpolation against official federal breakpoint tables for $PM_{2.5}, PM_{10}, O_3, NO_2, SO_2,$ and $CO$. The overall AQI is governed by the highest individual pollutant index.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Comparative Standard: European Air Quality Index (EAQI)
                      </span>
                      <Badge variant="neutral">Comparative</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      EAQI categorizes pollution based on 1-hour to 24-hour running averages against European Union air quality directives (Good, Fair, Moderate, Poor, Very Poor, Extremely Poor).
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* API Connectivity Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Authentic Public Data Integrations</CardTitle>
                  <CardDescription>Live health and environmental data feeds verification status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-xs">
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-semibold">Open-Meteo European CAMS Air Quality API</strong>
                      <span className="text-slate-400">Authentic atmospheric model estimates, 7-day forecast, and 30-day historical archives.</span>
                    </div>
                    <Badge variant="success">Connected (Free Public)</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-xs">
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-semibold">Open-Meteo Worldwide Geocoding API</strong>
                      <span className="text-slate-400">Debounced instant global city, district, and coordinates lookup.</span>
                    </div>
                    <Badge variant="success">Connected (Free Public)</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-xs">
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-semibold">OpenStreetMap & CARTO Dark Vector Tiles</strong>
                      <span className="text-slate-400">Interactive mapping infrastructure and spatial station rendering.</span>
                    </div>
                    <Badge variant="success">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-800 text-xs">
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-semibold">Continuous Ambient Air Quality Stations (CPCB, DPCC, SAFAR)</strong>
                      <span className="text-slate-400">Ground monitoring sensors across all Indian states and metropolitan centers.</span>
                    </div>
                    <Badge variant="success">Active (100% Free Public Data)</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge Submission Information */}
              <Card className="border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Let&apos;s Code Diwali Challenge 2026 Submission Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
                    <div><strong>Project Name:</strong> BreatheIQ</div>
                    <div><strong>Theme:</strong> Technology for Cleaner Air</div>
                    <div><strong>Development Type:</strong> Individual Project</div>
                    <div><strong>Developer:</strong> 2nd-Year CSE (IoT) Student</div>
                    <div><strong>Frontend:</strong> Next.js 14, React 18, TypeScript, Tailwind CSS</div>
                    <div><strong>Maps & Charts:</strong> Leaflet, React Leaflet, Recharts</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
