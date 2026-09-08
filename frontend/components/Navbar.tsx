"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFarm } from "@/lib/FarmContext";
import { useAuth } from "@/lib/AuthContext";
import { Menu, MapPin, LogOut, Navigation, UserCheck } from "lucide-react";
import { OfflineStatusBadge } from "@/components/OfflineStatusBadge";
import { LocationModal } from "@/components/LocationModal";

interface NavbarProps {
  onToggleMobile?: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; desc: string }> = {
  "/dashboard": {
    title: "Farm Overview",
    desc: "Monitor crop performance, soil conditions, predictions, and recommendations.",
  },
  "/dashboard/scenarios": {
    title: "Quantum Farm What-If Lab",
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
    title: "Weather Intelligence",
    desc: "Review thermal budget, precipitation outlooks, and quantum weather-to-yield simulation.",
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
  const router = useRouter();
  const { farms, activeFarmId, setActiveFarmId } = useFarm();
  const { user, signOut, location } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const routeInfo = ROUTE_TITLES[pathname] || {
    title: "Agricultural Intelligence",
    desc: "Precision agronomy workspace.",
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FJ";

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Mobile Toggle + Page Title & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobile && (
            <button
              onClick={onToggleMobile}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
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

        {/* Right: Location, Farm Selector, Offline badge, and Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Detected Location Chip (Clickable to change location) */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition cursor-pointer"
            title="Click to update farm location"
          >
            <Navigation className="w-3 h-3 text-emerald-700" />
            <span className="hidden md:inline max-w-[140px] truncate">
              {location.city}, {location.region}
            </span>
          </button>

          {/* Farm Selector Dropdown */}
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

          {/* Offline Sync Status Badge */}
          <OfflineStatusBadge />

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <span className="hidden xl:block text-xs font-semibold text-slate-800 max-w-[120px] truncate">
              {user?.fullName || "Farmer Jaswanth"}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
}
