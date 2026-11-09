'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationData } from '@/types';

export const DEFAULT_LOCATIONS: LocationData[] = [
  { id: 'delhi', name: 'New Delhi', country: 'India', countryCode: 'IN', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', admin1: 'Greater London', latitude: 51.5074, longitude: -0.1278 },
  { id: 'newyork', name: 'New York', country: 'United States', countryCode: 'US', admin1: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { id: 'beijing', name: 'Beijing', country: 'China', countryCode: 'CN', admin1: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
];

interface LocationContextType {
  currentLocation: LocationData;
  setCurrentLocation: (loc: LocationData) => void;
  savedLocations: LocationData[];
  saveLocation: (loc: LocationData) => void;
  removeSavedLocation: (id: string | number) => void;
  requestUserLocation: () => Promise<boolean>;
  isLoadingLocation: boolean;
  locationError: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(DEFAULT_LOCATIONS[0]);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>(DEFAULT_LOCATIONS.slice(0, 3));
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('breatheiq_current_location');
      if (stored) {
        setCurrentLocation(JSON.parse(stored));
      }
      const storedSaved = localStorage.getItem('breatheiq_saved_locations');
      if (storedSaved) {
        setSavedLocations(JSON.parse(storedSaved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetCurrentLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('breatheiq_current_location', JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  const saveLocation = (loc: LocationData) => {
    if (!savedLocations.some(l => l.id === loc.id || (l.latitude === loc.latitude && l.longitude === loc.longitude))) {
      const updated = [...savedLocations, loc];
      setSavedLocations(updated);
      try {
        localStorage.setItem('breatheiq_saved_locations', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const removeSavedLocation = (id: string | number) => {
    const updated = savedLocations.filter(l => l.id !== id);
    setSavedLocations(updated);
    try {
      localStorage.setItem('breatheiq_saved_locations', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const requestUserLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            // Reverse geocode via Open-Meteo or Nominatim
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=en&format=json`);
            let name = 'Your Current Location';
            let country = 'Detected';
            if (res.ok) {
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                name = data.results[0].name;
                country = data.results[0].country || country;
              }
            }

            const detectedLoc: LocationData = {
              id: 'detected-device-location',
              name,
              country,
              latitude: lat,
              longitude: lon,
              isUserLocation: true,
            };

            handleSetCurrentLocation(detectedLoc);
            setIsLoadingLocation(false);
            resolve(true);
          } catch {
            const fallbackLoc: LocationData = {
              id: 'detected-device-location',
              name: 'Current Coordinates',
              country: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
              latitude: lat,
              longitude: lon,
              isUserLocation: true,
            };
            handleSetCurrentLocation(fallbackLoc);
            setIsLoadingLocation(false);
            resolve(true);
          }
        },
        (err) => {
          setIsLoadingLocation(false);
          let message = 'Could not access device location.';
          if (err.code === 1) {
            message = 'Location permission was denied. You can search for any city manually above.';
          } else if (err.code === 2) {
            message = 'Location unavailable. Please search manually.';
          } else if (err.code === 3) {
            message = 'Location request timed out.';
          }
          setLocationError(message);
          resolve(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation: handleSetCurrentLocation,
        savedLocations,
        saveLocation,
        removeSavedLocation,
        requestUserLocation,
        isLoadingLocation,
        locationError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
