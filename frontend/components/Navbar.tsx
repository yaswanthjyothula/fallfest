"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, Farm } from "@/lib/api";
import { Menu, MapPin } from "lucide-react";

interface NavbarProps {
  onToggleMobile?: () => void;
  activeFarmId?: number;
  onFarmChange?: (farmId: number) => void;
}

const ROUTE_TITLES: Record<string, { title: string; desc: string }> = {
  "/dashboard": {
    title: "Farm Overview",
    desc: "Monitor crop performance, soil conditions, predictions, and recommendations.",
  },
  "/dashboard/predict": {
    title: "Crop Yield Prediction",
    desc: "Enter your farm conditions to estimate expected crop yield using quantum ML.",
  },
  "/dashboard/farms": {
    title: "Farm Analysis",
    desc: "Review detailed conditions and geospatial boundaries for each agricultural plot.",
  },
  "/dashboard/recommendations": {
    title: "Precision Recommendations",
    desc: "Review recommended fertilizer and irrigation adjustments for the selected field.",
  },
  "/dashboard/quantum": {
    title: "Quantum Model Analysis",
    desc: "Explore how agricultural data is represented and processed by the quantum model.",
  },
  "/dashboard/benchmarks": {
    title: "Model Performance Comparison",
    desc: "Compare quantum machine learning with established baseline models.",
  },
  "/dashboard/crop-health": {
    title: "Satellite Crop Health",
    desc: "Use Copernicus Sentinel-2 vegetation indices to evaluate current field vigor.",
  },
  "/dashboard/weather": {
    title: "Hyperlocal Weather",
    desc: "Review thermal budget, precipitation outlooks, and solar radiation conditions.",
  },
  "/dashboard/data": {
    title: "Farm Data",
    desc: "Inspect agricultural training datasets and upload verified CSV plot records.",
  },
  "/dashboard/reports": {
    title: "Agricultural Report",
    desc: "Create and export certified agronomic evaluation documents.",
  },
  "/dashboard/settings": {
    title: "Platform Settings",
    desc: "Configure agronomic measurement units, cloud database endpoints, and preferences.",
  },
  "/dashboard/help": {
    title: "Help and Support",
    desc: "Operational documentation, agronomic formulas, and platform support.",
  },
};

export function Navbar({ onToggleMobile, activeFarmId, onFarmChange }: NavbarProps) {
  const pathname = usePathname();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const routeInfo = ROUTE_TITLES[pathname] || {
    title: "Agricultural Intelligence",
    desc: "Precision agronomy workspace.",
  };

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
        console.warn("Notice: Using default farm selection context");
      }
    }
    loadFarms();
  }, [activeFarmId]);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle + Page Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {routeInfo.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            {routeInfo.desc}
          </p>
        </div>
      </div>

      {/* Right: Farm Selector + User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Farm Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
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
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs pr-1"
            aria-label="Select active farm"
          >
            {farms.length === 0 ? (
              <option value="">Green Valley Station (120 ha)</option>
            ) : (
              farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.total_area_hectares} ha)
                </option>
              ))
            )}
          </select>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            AT
          </div>
          <span className="hidden md:block text-xs font-semibold text-slate-800">
            Dr. Aris Thorne
          </span>
        </div>
      </div>
    </header>
  );
}
