'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  Check, 
  Loader2, 
  X,
  ExternalLink
} from 'lucide-react';
import { useLocation, DEFAULT_LOCATIONS } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { LocationData } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenNotifications?: () => void;
  onLocationSelect?: (result: any) => void;
  currentLocation?: string;
}

export function Header({ onToggleMobileMenu, onOpenNotifications }: HeaderProps) {
  const { currentLocation, setCurrentLocation, requestUserLocation, isLoadingLocation, locationError } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search via Open-Meteo Geocoding
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery.trim()
          )}&count=6&language=en&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && Array.isArray(data.results)) {
            const mapped: LocationData[] = data.results.map((r: any) => ({
              id: r.id || `${r.latitude}_${r.longitude}`,
              name: r.name,
              country: r.country || '',
              countryCode: r.country_code,
              admin1: r.admin1,
              latitude: r.latitude,
              longitude: r.longitude,
              timezone: r.timezone,
              elevation: r.elevation,
            }));
            setSearchResults(mapped);
            setIsDropdownOpen(true);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 border-b border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Current Location Chip */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Location Display Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">
            {currentLocation.name}
          </span>
          {currentLocation.country && (
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              , {currentLocation.country}
            </span>
          )}
        </div>

        {/* Detect Location Button */}
        <button
          onClick={() => requestUserLocation()}
          disabled={isLoadingLocation}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
          title="Use my current GPS location"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0 || !searchQuery) {
                setIsDropdownOpen(true);
              }
            }}
            placeholder="Search city, station, or coordinates..."
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Searching worldwide locations...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Search Results
                </div>
                {searchResults.map((loc) => {
                  const isSelected = currentLocation.name.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-colors',
                        isSelected && 'text-emerald-500 font-semibold bg-emerald-500/10'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-medium">{loc.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {loc.latitude !== undefined && loc.longitude !== undefined ? `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No matching locations found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="py-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Popular Monitoring Hubs
                </div>
                {DEFAULT_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <span>{loc.name}, {loc.country}</span>
                    <span className="text-[11px] text-slate-400">Hub</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Theme Switcher & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-navy-800"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors relative border border-transparent hover:border-slate-200 dark:hover:border-navy-800"
          title="Air Quality Alerts & Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Open Public Access Status */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-navy-800">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Public Access • No Sign-In</span>
          </div>
        </div>
      </div>
    </header>
  );
}
