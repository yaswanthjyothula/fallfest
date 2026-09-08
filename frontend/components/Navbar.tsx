"use client";

import React, { useEffect, useState } from "react";
import { api, Farm } from "@/lib/api";
import { ChevronDown, MapPin, Activity, Bell, Sparkles, User } from "lucide-react";

interface NavbarProps {
  activeFarmId?: number;
  onFarmChange?: (farmId: number) => void;
}

export function Navbar({ activeFarmId, onFarmChange }: NavbarProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("Ready");

  useEffect(() => {
    async function loadFarms() {
      try {
        const farmList = await api.getFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          const current = activeFarmId
            ? farmList.find((f) => f.id === activeFarmId) || farmList[0]
            : farmList[0];
          setSelectedFarm(current);
          if (onFarmChange && !activeFarmId) {
            onFarmChange(current.id);
          }
        }
      } catch (err) {
        console.error("Failed to load farms:", err);
      }
    }

    async function checkHealth() {
      try {
        const health = await api.getHealth();
        if (health.status === "healthy") {
          setHealthStatus("System Online");
        }
      } catch {
        setHealthStatus("Offline / Demo Mode");
      }
    }

    loadFarms();
    checkHealth();
  }, [activeFarmId]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Active Farm Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/80 transition-colors">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] font-medium leading-none mb-0.5">Active Holding</span>
            <select
              value={selectedFarm?.id || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const found = farms.find((f) => f.id === id);
                if (found) {
                  setSelectedFarm(found);
                  if (onFarmChange) onFarmChange(id);
                }
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2 text-xs"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.total_area_hectares} ha)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedFarm && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {selectedFarm.latitude.toFixed(4)}° N, {selectedFarm.longitude.toFixed(4)}° E
            </span>
            <span className="text-slate-300">•</span>
            <span>{selectedFarm.location}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Health pill, notifications, profile */}
      <div className="flex items-center gap-3">
        {/* System Health Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-[11px] font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{healthStatus}</span>
        </div>

        {/* Action Button */}
        <a
          href="/dashboard/predict"
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run Inference</span>
        </a>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Dr. Aris Thorne</div>
            <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
