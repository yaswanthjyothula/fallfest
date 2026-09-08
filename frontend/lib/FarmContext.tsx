"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, Farm } from "@/lib/api";

interface FarmContextType {
  farms: Farm[];
  activeFarm: Farm | null;
  activeFarmId: number | undefined;
  setActiveFarmId: (id: number) => void;
  loadingFarms: boolean;
  refreshFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType>({
  farms: [],
  activeFarm: null,
  activeFarmId: undefined,
  setActiveFarmId: () => {},
  loadingFarms: true,
  refreshFarms: async () => {},
});

const DEFAULT_FARMS: Farm[] = [
  {
    id: 1,
    name: "Green Valley Agricultural Station",
    location: "Krishna River Basin (Zone 4B)",
    country: "India",
    latitude: 16.5062,
    longitude: 80.6480,
    total_area_hectares: 120.0,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Coastal Alluvial Research Plot",
    location: "Godavari Delta Agro Zone",
    country: "India",
    latitude: 16.9891,
    longitude: 82.2475,
    total_area_hectares: 85.5,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Deccan Precision Agro Center",
    location: "Telangana Central Plateau",
    country: "India",
    latitude: 17.3850,
    longitude: 78.4867,
    total_area_hectares: 150.0,
    created_at: new Date().toISOString(),
  },
];

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>(DEFAULT_FARMS);
  const [activeFarmId, setActiveFarmIdState] = useState<number>(1);
  const [loadingFarms, setLoadingFarms] = useState(true);

  async function loadFarms() {
    try {
      setLoadingFarms(true);
      const list = await api.getFarms();
      if (list && list.length > 0) {
        setFarms(list);
        if (!activeFarmId || !list.some((f) => f.id === activeFarmId)) {
          setActiveFarmIdState(list[0].id);
        }
      }
    } catch (e) {
      console.warn("Using baseline farm holding profiles");
    } finally {
      setLoadingFarms(false);
    }
  }

  useEffect(() => {
    loadFarms();
  }, []);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || null;

  function setActiveFarmId(id: number) {
    setActiveFarmIdState(id);
  }

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        activeFarmId,
        setActiveFarmId,
        loadingFarms,
        refreshFarms: loadFarms,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
