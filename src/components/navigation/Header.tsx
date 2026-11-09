"use client";

import { useState, useCallback } from "react";
import { Search, Bell, Sun, Moon, MapPin, X, Loader2 } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  coordinates: { lat: number; lon: number };
  country?: string;
}

interface HeaderProps {
  onLocationSelect?: (result: SearchResult) => void;
  currentLocation?: string;
}

export function Header({ onLocationSelect, currentLocation }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      // Use Nominatim (OpenStreetMap) geocoding — free, no key required
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const mapped: SearchResult[] = data.map((item: any) => ({
        id: item.place_id,
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        coordinates: { lat: parseFloat(item.lat), lon: parseFloat(item.lon) },
        country: item.address?.country,
      }));
      setResults(mapped);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    const tid = setTimeout(() => search(v), 400);
    return () => clearTimeout(tid);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setShowDropdown(false);
    onLocationSelect?.(result);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-700/50 px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Location indicator */}
        {currentLocation && (
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 shrink-0">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="max-w-[200px] truncate">{currentLocation}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
            {loading ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <input
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search city or location…"
              className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none w-full"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setShowDropdown(false);
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{r.name}</p>
                      <p className="text-xs text-slate-500 truncate">{r.displayName}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </button>

          {/* User avatar placeholder */}
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

