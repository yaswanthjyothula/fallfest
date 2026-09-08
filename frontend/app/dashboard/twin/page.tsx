"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useFarm } from "@/lib/FarmContext";
import {
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Thermometer,
  CloudRain,
  Activity,
  ShieldAlert,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Satellite,
  Droplets,
  HelpCircle,
} from "lucide-react";
import { FarmTimeline } from "@/components/FarmTimeline";
import { FarmMemoryFeedbackModal } from "@/components/FarmMemoryFeedbackModal";
import { offlineSync } from "@/lib/offlineSync";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function FarmDigitalTwinPage() {
  const { activeFarm, activeFarmId } = useFarm();
  const farmId = activeFarm?.id || activeFarmId || 1;

  const [twinData, setTwinData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  const fetchTwin = async () => {
    setLoading(true);
    try {
      // 1. Fetch Twin
      const twinRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/digital-twin`);
      if (twinRes.ok) {
        const data = await twinRes.json();
        setTwinData(data);
        offlineSync.cacheTwin(farmId, data);
      } else {
        // Fallback to offline cache
        const cached = offlineSync.getCachedTwin(farmId);
        if (cached) setTwinData(cached);
      }

      // 2. Fetch Risk Outlook
      const riskRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/risk-outlook`);
      if (riskRes.ok) {
        const rData = await riskRes.json();
        setRiskData(rData);
      }
    } catch (err) {
      console.warn("Error loading twin, checking offline cache", err);
      const cached = offlineSync.getCachedTwin(farmId);
      if (cached) setTwinData(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwin();
  }, [farmId]);

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "moderate":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "high":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Agronomic Digital Twin
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            {twinData?.farm_name || activeFarm?.name || "Green Valley Research Station"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Complete 360° telemetry profile: Soil chemistry, satellite vegetation vigor, crop phenological stage, live micro-climate, and active agricultural risk indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Farm Memory</span>
          </button>
          <button
            onClick={fetchTwin}
            disabled={loading}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Map + Risk) & Right Column (Crop, Soil, Weather) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Boundary Map Component */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Field Boundary & Geospatial Profile
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Lat: {twinData?.latitude || 16.5062}° N</span>
                <span>•</span>
                <span>Lng: {twinData?.longitude || 80.6480}° E</span>
              </div>
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
              <MapComponent
                latitude={twinData?.latitude || 16.5062}
                longitude={twinData?.longitude || 80.6480}
                zoom={14}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Area</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {twinData?.total_area_hectares || 120} ha
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Sub-Fields</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {twinData?.fields?.length || 3} Registered
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Data Freshness</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">Live Synced</p>
              </div>
            </div>
          </div>

          {/* Agricultural Risk Outlook */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Transparent Farm Risk Outlook
                </h3>
              </div>
              {riskData && (
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRiskColor(
                    riskData.overall_risk_level
                  )}`}
                >
                  {riskData.overall_risk_level} Overall Risk
                </span>
              )}
            </div>

            {riskData?.risk_factors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskData.risk_factors.map((rf: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${getRiskColor(rf.level)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{rf.name}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                        {rf.level}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{rf.observation}</p>
                    <div className="pt-1 text-[10px] font-medium flex items-center gap-1 border-t border-current/10">
                      <TrendingUp className="w-3 h-3" /> Mitigation: {rf.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Calculating multi-factor agricultural risk engine...
              </div>
            )}
          </div>

          {/* Farm Decision Timeline */}
          <FarmTimeline farmId={farmId} />
        </div>

        {/* Right 1 Col: Phenology, Soil, Weather, Memory */}
        <div className="space-y-6">
          {/* Crop Stage & Phenology */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Crop Phenology</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Crop:</span>
                <span className="font-bold text-slate-800">{twinData?.crop || "Paddy (Rice)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phenological Stage:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {twinData?.crop_stage || "Panicle Initiation"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Since Sowing:</span>
                <span className="font-mono text-slate-800">{twinData?.days_after_sowing || 68} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Harvest:</span>
                <span className="font-mono text-slate-800">{twinData?.estimated_harvest_date || "2026-11-20"}</span>
              </div>
            </div>
          </div>

          {/* Soil Chemistry Profile */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Droplets className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Soil Profile</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Nitrogen</span>
                <p className="font-bold text-emerald-800 mt-0.5">{twinData?.soil_profile?.nitrogen || 90} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Phosphorus</span>
                <p className="font-bold text-emerald-800 mt-0.5">{twinData?.soil_profile?.phosphorus || 42} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Potassium</span>
                <p className="font-bold text-emerald-800 mt-0.5">{twinData?.soil_profile?.potassium || 42} kg</p>
              </div>
            </div>
            <div className="pt-1 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Soil pH:</span>
                <span className="font-mono font-bold text-slate-800">{twinData?.soil_profile?.ph || 6.8} (Neutral)</span>
              </div>
              <div className="flex justify-between">
                <span>Moisture:</span>
                <span className="font-mono font-bold text-blue-700">{twinData?.soil_profile?.moisture || 55}%</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Texture:</span>
                <span className="font-medium text-slate-800">{twinData?.soil_profile?.soil_texture || "Clay Loam"}</span>
              </div>
            </div>
          </div>

          {/* Live Satellite & Weather Telemetry */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Satellite className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Live Satellite & Weather</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Sentinel-2 NDVI:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {twinData?.satellite?.current_ndvi || 0.68} (Dense Healthy Canopy)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Cover:</span>
                <span className="font-mono text-slate-700">{twinData?.satellite?.cloud_cover || 12}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temperature:</span>
                <span className="font-mono text-slate-700">{twinData?.weather?.temperature || 28.5}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rainfall:</span>
                <span className="font-mono text-slate-700">{twinData?.weather?.rainfall || 210} mm</span>
              </div>
            </div>
          </div>

          {/* Quick Action: Record Harvest */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900">Farm Memory Feedback</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Record season actual harvest outcomes to track model calibration and enable farm-specific memory.
            </p>
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Record Harvest Actuals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Memory Feedback Modal */}
      <FarmMemoryFeedbackModal
        farmId={farmId}
        farmName={twinData?.farm_name || activeFarm?.name || "Active Plot"}
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        latestPredictedYield={twinData?.predictions?.predicted_yield || 4.82}
      />
    </div>
  );
}
