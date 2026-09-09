"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  source: "gps" | "manual" | "farm" | "last_known";
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
}

export type LocationStatus =
  | "live"
  | "updating"
  | "denied"
  | "unavailable"
  | "manual"
  | "idle";

export interface LocationContextType {
  userLocation: UserLocation | null;
  lastKnownLocation: UserLocation | null;
  locationStatus: LocationStatus;
  isWatching: boolean;
  accuracy: number | undefined;
  timestamp: number | undefined;
  timeSinceUpdateSec: number;
  permissionState: "prompt" | "granted" | "denied" | "unknown";
  isPromptOpen: boolean;
  setIsPromptOpen: (open: boolean) => void;
  startWatching: () => void;
  stopWatching: () => void;
  requestLocationPermission: () => Promise<boolean>;
  setManualLocation: (lat: number, lon: number, city?: string, state?: string) => void;
  setFromFarmLocation: (lat: number, lon: number, farmName: string) => void;
  clearLocation: () => void;
  calculateDistanceKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

// Haversine Distance Formula in Kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0.0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Dynamic Reverse Geocoding without hardcoded fallback cities
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ city?: string; district?: string; state?: string; country?: string; formatted: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality;
      const district = addr.county || addr.district || addr.suburb;
      const state = addr.state || addr.state_district;
      const country = addr.country;
      const parts = [city || district, state].filter(Boolean);
      const formatted = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
      return { city, district, state, country, formatted };
    }
  } catch (err) {
    console.warn("Reverse geocode fetch notice:", err);
  }
  return {
    formatted: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
  };
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [timeSinceUpdateSec, setTimeSinceUpdateSec] = useState<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const lastDispatchedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // 1. Ticking timer to show relative update age ("Updated X seconds ago")
  useEffect(() => {
    const interval = setInterval(() => {
      if (userLocation?.timestamp) {
        const elapsed = Math.max(0, Math.floor((Date.now() - userLocation.timestamp) / 1000));
        setTimeSinceUpdateSec(elapsed);
      } else if (lastKnownLocation?.timestamp) {
        const elapsed = Math.max(0, Math.floor((Date.now() - lastKnownLocation.timestamp) / 1000));
        setTimeSinceUpdateSec(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userLocation, lastKnownLocation]);

  // 2. Restore last known location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("agri_last_known_location");
      if (saved) {
        const parsed: UserLocation = JSON.parse(saved);
        setLastKnownLocation({
          ...parsed,
          source: "last_known",
        });
      }
    } catch {
      // ignore
    }

    // Check browser permission status if supported
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as any }).then((perm) => {
        setPermissionState(perm.state as any);
        perm.onchange = () => {
          setPermissionState(perm.state as any);
          if (perm.state === "denied") {
            setLocationStatus("denied");
          }
        };
      }).catch(() => {
        setPermissionState("unknown");
      });
    }
  }, []);

  // 3. Process Position from Browser Geolocation API
  const handlePositionSuccess = useCallback(async (pos: GeolocationPosition) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    const altitude = pos.coords.altitude || undefined;
    const heading = pos.coords.heading || undefined;
    const speed = pos.coords.speed || undefined;
    const now = Date.now();

    // Movement threshold check: 25 meters (0.025 km)
    if (lastDispatchedCoordsRef.current) {
      const dist = calculateHaversineDistanceKm(
        lastDispatchedCoordsRef.current.lat,
        lastDispatchedCoordsRef.current.lon,
        lat,
        lon
      );
      if (dist < 0.025 && userLocation) {
        // Minor movement: update timestamp and accuracy without refetching geocode
        setUserLocation((prev) =>
          prev
            ? { ...prev, accuracy, timestamp: now }
            : null
        );
        setLocationStatus("live");
        return;
      }
    }

    lastDispatchedCoordsRef.current = { lat, lon };

    // Resolve human-readable place without hardcoding any fallback city
    const geo = await reverseGeocodeCoordinates(lat, lon);

    const newLocation: UserLocation = {
      latitude: lat,
      longitude: lon,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp: now,
      source: "gps",
      city: geo.city,
      district: geo.district,
      state: geo.state,
      country: geo.country,
      formattedAddress: geo.formatted,
    };

    setUserLocation(newLocation);
    setLastKnownLocation(newLocation);
    setLocationStatus("live");
    setPermissionState("granted");

    try {
      localStorage.setItem("agri_last_known_location", JSON.stringify(newLocation));
    } catch {
      // ignore
    }
  }, [userLocation]);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    console.warn("Geolocation position watch error:", err.message);
    if (err.code === err.PERMISSION_DENIED) {
      setLocationStatus("denied");
      setPermissionState("denied");
    } else {
      setLocationStatus("unavailable");
    }
  }, []);

  // 4. Start Watching User Location Continuously
  const startWatching = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setLocationStatus("updating");
    setIsWatching(true);

    try {
      const id = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
      watchIdRef.current = id;
    } catch (e) {
      console.warn("Could not initiate geolocation watchPosition:", e);
      setLocationStatus("unavailable");
      setIsWatching(false);
    }
  }, [handlePositionSuccess, handlePositionError]);

  // 5. Stop Watching User Location & Clean Up
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 6. Explicit Request Location Permission
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return false;
    }

    setLocationStatus("updating");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionSuccess(pos);
          startWatching();
          resolve(true);
        },
        (err) => {
          handlePositionError(err);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    });
  }, [handlePositionSuccess, handlePositionError, startWatching]);

  // 7. Set Manual Location (never marked as LIVE)
  const setManualLocation = useCallback(async (lat: number, lon: number, city?: string, state?: string) => {
    stopWatching();
    setLocationStatus("manual");

    let formatted = `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`;
    let resolvedCity = city;
    let resolvedState = state;

    if (!city || !state) {
      const geo = await reverseGeocodeCoordinates(lat, lon);
      resolvedCity = resolvedCity || geo.city;
      resolvedState = resolvedState || geo.state;
      formatted = geo.formatted;
    } else {
      formatted = `${resolvedCity}, ${resolvedState}`;
    }

    const manualLoc: UserLocation = {
      latitude: lat,
      longitude: lon,
      timestamp: Date.now(),
      source: "manual",
      city: resolvedCity,
      state: resolvedState,
      formattedAddress: formatted,
    };

    setUserLocation(manualLoc);
    setLastKnownLocation(manualLoc);

    try {
      localStorage.setItem("agri_last_known_location", JSON.stringify(manualLoc));
    } catch {
      // ignore
    }
  }, [stopWatching]);

  // 8. Set From Selected Farm Location
  const setFromFarmLocation = useCallback((lat: number, lon: number, farmName: string) => {
    const farmLoc: UserLocation = {
      latitude: lat,
      longitude: lon,
      timestamp: Date.now(),
      source: "farm",
      formattedAddress: `${farmName} Coordinates`,
    };
    setUserLocation(farmLoc);
    setLocationStatus("manual");
  }, []);

  // 9. Clear Location (used upon Sign Out to prevent tenant leakage)
  const clearLocation = useCallback(() => {
    stopWatching();
    setUserLocation(null);
    setLastKnownLocation(null);
    setLocationStatus("idle");
    lastDispatchedCoordsRef.current = null;
    try {
      localStorage.removeItem("agri_last_known_location");
      localStorage.removeItem("agri_user_location");
    } catch {
      // ignore
    }
  }, [stopWatching]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        lastKnownLocation,
        locationStatus,
        isWatching,
        accuracy: userLocation?.accuracy,
        timestamp: userLocation?.timestamp,
        timeSinceUpdateSec,
        permissionState,
        isPromptOpen,
        setIsPromptOpen,
        startWatching,
        stopWatching,
        requestLocationPermission,
        setManualLocation,
        setFromFarmLocation,
        clearLocation,
        calculateDistanceKm: calculateHaversineDistanceKm,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within a LocationProvider");
  }
  return context;
}
