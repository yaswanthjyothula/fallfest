"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmIdState] = useState<number | undefined>(undefined);
  const [loadingFarms, setLoadingFarms] = useState(true);

  const loadFarms = useCallback(async () => {
    try {
      setLoadingFarms(true);
      const list = await api.getFarms();
      if (Array.isArray(list)) {
        setFarms(list);
        if (list.length > 0) {
          if (!activeFarmId || !list.some((f) => f.id === activeFarmId)) {
            setActiveFarmIdState(list[0].id);
          }
        } else {
          setActiveFarmIdState(undefined);
        }
      }
    } catch (e) {
      console.warn("Farm context load notice:", e);
      setFarms([]);
      setActiveFarmIdState(undefined);
    } finally {
      setLoadingFarms(false);
    }
  }, [activeFarmId]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const activeFarm = activeFarmId ? (farms.find((f) => f.id === activeFarmId) || null) : (farms.length > 0 ? farms[0] : null);

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

