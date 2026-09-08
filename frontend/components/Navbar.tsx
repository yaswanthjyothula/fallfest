"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useFarm } from "@/lib/FarmContext";
import { Menu, MapPin, Mic } from "lucide-react";
import { OfflineStatusBadge } from "@/components/OfflineStatusBadge";
import { VoiceFarmerAssistant } from "@/components/VoiceFarmerAssistant";

interface NavbarProps {
  onToggleMobile?: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; desc: string }> = {
  "/dashboard": {
    title: "Farm Overview",
    desc: "Monitor crop performance, soil conditions, predictions, and recommendations.",
  },
  "/dashboard/scenarios": {
    title: "What-If Agricultural Decision Simulator",
    desc: "Simulate Nitrogen, Phosphorus, Potassium, and Irrigation scenarios with live model comparison.",
  },
  "/dashboard/twin": {
    title: "Farm Digital Twin",
    desc: "Unified 360° telemetry: Soil chemistry, satellite vegetation vigor, crop phenology, and risk outlook.",
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

export function Navbar({ onToggleMobile }: NavbarProps) {
  const pathname = usePathname();
  const { farms, activeFarm, activeFarmId, setActiveFarmId } = useFarm();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);

  const routeInfo = ROUTE_TITLES[pathname] || {
    title: "Agricultural Intelligence",
    desc: "Precision agronomy workspace.",
  };

  return (
    <>
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

        {/* Right: Offline status, Voice assistant, Farm Selector, and Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Offline Sync Status Badge */}
          <OfflineStatusBadge />

          {/* Voice-First Farmer Mode Trigger Button */}
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Open Voice-First Farmer Mode"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden md:inline">Voice Assistant</span>
          </button>

          {/* Farm Selector Dropdown Options */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <select
              value={activeFarmId || ""}
              onChange={(e) => setActiveFarmId(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs pr-1"
              aria-label="Select active farm"
            >
              {farms.length === 0 ? (
                <option value="1">Krishna Basin Research Station (120 ha)</option>
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

      {/* Voice Assistant Modal */}
      <VoiceFarmerAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
}
