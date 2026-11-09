"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Header } from "@/components/navigation/Header";
import { useState, useCallback } from "react";

interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  coordinates: { lat: number; lon: number };
  country?: string;
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [currentLocation, setCurrentLocation] = useState("New Delhi, India");

  const handleLocationSelect = useCallback((result: SearchResult) => {
    setCurrentLocation(result.name);
    // Dispatch a custom event so pages can subscribe
    window.dispatchEvent(
      new CustomEvent("breatheiq:location-change", {
        detail: {
          name: result.name,
          displayName: result.displayName,
          coordinates: result.coordinates,
        },
      })
    );
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      {/* Main content area — offset for sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

