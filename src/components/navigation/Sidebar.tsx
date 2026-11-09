'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MapPin, 
  LineChart, 
  GitCompare, 
  HeartPulse, 
  CloudSun, 
  Sparkles, 
  Compass, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Wind,
  ShieldCheck,
  X
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', label: 'Live Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Explore Map', icon: MapPin },
  { id: 'analytics', label: 'Analytics & Trends', icon: LineChart },
  { id: 'comparison', label: 'Location Comparison', icon: GitCompare },
  { id: 'health', label: 'Health Insights', icon: HeartPulse },
  { id: 'forecast', label: 'Air Quality Forecast', icon: CloudSun },
  { id: 'clean-air', label: 'Clean Air Finder', icon: Compass, badge: 'New' },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
  { id: 'alerts', label: 'Smart Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeTab: propActiveTab,
  setActiveTab,
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed,
  isMobileOpen: propIsMobileOpen,
  setIsMobileOpen: propSetIsMobileOpen,
}: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [localMobileOpen, setLocalMobileOpen] = useState(false);

  const isCollapsed = propIsCollapsed ?? localCollapsed;
  const setIsCollapsed = propSetIsCollapsed ?? setLocalCollapsed;
  const isMobileOpen = propIsMobileOpen ?? localMobileOpen;
  const setIsMobileOpen = propSetIsMobileOpen ?? setLocalMobileOpen;

  const activeTab = useMemo<NavigationTab>(() => {
    if (propActiveTab) return propActiveTab;
    if (!pathname || pathname === '/') return 'overview';
    const segment = pathname.replace(/^\//, '').split('/')[0] as NavigationTab;
    return segment || 'overview';
  }, [propActiveTab, pathname]);

  const handleNavClick = (tab: NavigationTab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      router.push(tab === 'overview' ? '/' : `/${tab}`);
    }
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-navy-800">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleNavClick('overview')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Wind className="w-5 h-5 text-navy-950 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                BreatheIQ
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                Air Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-800/60'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                )}
              />
              {!isCollapsed && (
                <span className="truncate text-left flex-1">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                  item.badge === 'AI' 
                    ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400'
                )}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed Active Indicator Pill */}
              {isCollapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Challenge Tagline & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-navy-800">
        {!isCollapsed ? (
          <div className="rounded-xl bg-slate-100 dark:bg-navy-850 p-3 border border-slate-200/80 dark:border-navy-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diwali Challenge 2026</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Theme: Technology for Cleaner Air
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Let's Code Diwali Challenge 2026">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0',
          'bg-slate-50 border-r border-slate-200',
          'dark:bg-navy-900/95 dark:border-navy-800 backdrop-blur-md',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden transition-transform duration-300 ease-in-out',
          'bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-800 shadow-2xl',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
