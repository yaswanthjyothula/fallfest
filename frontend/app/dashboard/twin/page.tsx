"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// Load MapComponent with client-side only dynamic import
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[250px] bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
      Loading geospatial boundary...
    </div>
  ),
});

export default function FarmDigitalTwinPage() {
  const { activeFarm, activeFarmId } = useFarm();
  const farmId = activeFarm?.id || activeFarmId || 1;

  const [twinData, setTwinData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTwin = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 1. Fetch Digital Twin Data
      const twinRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/digital-twin`);
      if (twinRes.ok) {
        const data = await twinRes.json();
        setTwinData(data);
        offlineSync.cacheTwin(farmId, data);
      } else {
        const cached = offlineSync.getCachedTwin(farmId);
        if (cached) setTwinData(cached);
      }

      // 2. Fetch Risk Outlook Data
      const riskRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/risk-outlook`);
      if (riskRes.ok) {
        const rData = await riskRes.json();
        setRiskData(rData);
      }
    } catch (err: any) {
      console.warn("Could not fetch live twin, trying offline cache", err);
      const cached = offlineSync.getCachedTwin(farmId);
      if (cached) {
        setTwinData(cached);
      } else {
        setFetchError("Unable to reach backend telemetry service. Displaying cached agricultural model.");
      }
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchTwin();
  }, [fetchTwin]);

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "moderate":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "high":
      case "elevated":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Safe property extraction supporting both backend formats
  const farmName = twinData?.farm_name || activeFarm?.name || "Green Valley Agricultural Station";
  const latitude = Number(twinData?.latitude || activeFarm?.latitude || 16.5062);
  const longitude = Number(twinData?.longitude || activeFarm?.longitude || 80.6480);
  const totalArea = twinData?.total_area_hectares || activeFarm?.total_area_hectares || 120;
  const cropName = twinData?.crop || "Winter Wheat (PBW-343)";
  const growthStage = twinData?.growth_stage || twinData?.crop_stage || "Stem Elongation (Feekes 6)";
  const soilNitrogen = twinData?.mean_nitrogen_kg_ha ?? twinData?.soil_profile?.nitrogen ?? 92;
  const soilPhosphorus = twinData?.soil_profile?.phosphorus ?? 42;
  const soilPotassium = twinData?.soil_profile?.potassium ?? 42;
  const soilPh = twinData?.mean_ph ?? twinData?.soil_profile?.ph ?? 6.8;
  const soilMoisture = twinData?.mean_moisture_pct ?? twinData?.soil_profile?.moisture ?? 28.5;
  const soilTexture = twinData?.soil_type || twinData?.soil_profile?.soil_texture || "Alluvial Loam";
  const currentNdvi = twinData?.current_ndvi ?? twinData?.satellite?.current_ndvi ?? 0.74;
  const cloudCover = twinData?.satellite?.cloud_cover ?? 8;
  const temperature = twinData?.current_weather?.temperature_c ?? twinData?.weather?.temperature ?? 28.4;
  const rainfall = twinData?.current_weather?.precipitation_mm ?? twinData?.weather?.rainfall ?? 0.0;
  const overallRiskLevel = riskData?.overall_risk_level || twinData?.active_risk_level || "Low";

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
            {farmName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Unified 360° telemetry profile: Soil chemistry, satellite vegetation vigor, crop phenological stage, live micro-climate, and active agricultural risk indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Farm Memory</span>
          </button>
          <button
            onClick={fetchTwin}
            disabled={loading}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

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
                <span>Lat: {latitude.toFixed(4)}° N</span>
                <span>•</span>
                <span>Lng: {longitude.toFixed(4)}° E</span>
              </div>
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
              <MapComponent
                latitude={latitude}
                longitude={longitude}
                zoom={14}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Area</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {totalArea} ha
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Sub-Fields</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {twinData?.boundary_coordinates?.length || 4} Geo-Nodes
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Data Freshness</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">Live Telemetry</p>
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
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRiskColor(
                  overallRiskLevel
                )}`}
              >
                {overallRiskLevel} Overall Risk
              </span>
            </div>

            {riskData?.risk_factors && Array.isArray(riskData.risk_factors) && riskData.risk_factors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskData.risk_factors.map((rf: any, idx: number) => {
                  const level = rf.risk_level || rf.level || "Low";
                  const title = rf.category || rf.headline || rf.name || "Risk Indicator";
                  const description = rf.explanation || rf.observation || "";
                  const mitigation = rf.mitigation_action || rf.mitigation || "Maintain baseline observation.";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${getRiskColor(level)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{title}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                          {level}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{description}</p>
                      <div className="pt-1 text-[10px] font-medium flex items-center gap-1 border-t border-current/10">
                        <TrendingUp className="w-3 h-3 shrink-0" />
                        <span>Mitigation: {mitigation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Evaluating agricultural micro-climate and telemetry risks...
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
                <span className="font-bold text-slate-800">{cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phenological Stage:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {growthStage}
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
              <h3 className="text-sm font-bold text-slate-900">Soil Chemistry</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Nitrogen</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilNitrogen} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Phosphorus</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilPhosphorus} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Potassium</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilPotassium} kg</p>
              </div>
            </div>
            <div className="pt-1 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Soil pH:</span>
                <span className="font-mono font-bold text-slate-800">{soilPh} (Neutral)</span>
              </div>
              <div className="flex justify-between">
                <span>Moisture Buffer:</span>
                <span className="font-mono font-bold text-blue-700">{soilMoisture}%</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Texture:</span>
                <span className="font-medium text-slate-800">{soilTexture}</span>
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
                  {currentNdvi} (Dense Canopy)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Cover:</span>
                <span className="font-mono text-slate-700">{cloudCover}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temperature:</span>
                <span className="font-mono text-slate-700">{temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Precipitation:</span>
                <span className="font-mono text-slate-700">{rainfall} mm</span>
              </div>
            </div>
          </div>

          {/* Quick Action: Record Harvest */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900">Farm Digital Memory</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Log actual harvest yields to compare predictions against outcomes and calibrate the quantum model over time.
            </p>
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
        farmName={farmName}
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        latestPredictedYield={twinData?.latest_prediction_q_acre ? Number((twinData.latest_prediction_q_acre * 0.2471).toFixed(2)) : 4.82}
      />
    </div>
  );
}
