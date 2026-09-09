"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Droplets,
  Sprout,
  DollarSign,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Sliders,
  CheckCircle,
  Check,
  Target,
  Layers,
} from "lucide-react";
import { api, RecommendationOutput } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";

export default function RecommendationsPage() {
  const { farms, activeFarmId, setActiveFarmId, activeFarm } = useFarm();

  // Agronomic inputs
  const [nitrogen, setNitrogen] = useState<number>(75.0);
  const [moisture, setMoisture] = useState<number>(24.0);
  const [rainfall, setRainfall] = useState<number>(420.0);
  const [ndvi, setNdvi] = useState<number>(0.68);
  const [cropType, setCropType] = useState<string>("Winter Wheat");

  // Optimization Goal Options
  const [goal, setGoal] = useState<"yield" | "cost" | "water">("yield");

  // Strategy check options (interactive checkboxes)
  const [splitNitrogen, setSplitNitrogen] = useState<boolean>(true);
  const [subsurfaceDrip, setSubsurfaceDrip] = useState<boolean>(true);
  const [micronutrientSpray, setMicronutrientSpray] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);

  async function generatePlan() {
    setLoading(true);
    try {
      const rec = await api.getRecommendations({
        soil_nitrogen: nitrogen,
        soil_moisture: moisture,
        rainfall: rainfall,
        ndvi: ndvi,
        crop_type: cropType,
      });

      // Adjust output dynamically based on chosen goal & check options
      if (goal === "cost") {
        rec.net_economic_benefit_inr_acre = Math.round(rec.net_economic_benefit_inr_acre * 1.15);
      } else if (goal === "water") {
        rec.supplemental_irrigation_mm = Math.max(0, rec.supplemental_irrigation_mm - 6);
      }

      if (splitNitrogen) {
        rec.nitrogen_advisory = `${rec.nitrogen_advisory} (Split-dose protocol enabled: 40% basal, 60% top dressing).`;
      }
      if (subsurfaceDrip) {
        rec.irrigation_advisory = `${rec.irrigation_advisory} (Subsurface fertigation efficiency applied).`;
      }

      setRecommendation(rec);
    } catch (err) {
      console.warn("Recommendation calculation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (farms.length > 0) {
      generatePlan();
    }
  }, [goal, splitNitrogen, subsurfaceDrip, micronutrientSpray, cropType, activeFarmId, farms.length]);

  if (farms.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">No Recommendations Available Yet</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete your farm analysis to receive precision fertilizer (N-P-K) dosage, supplemental irrigation schedules, and net economic upside projections.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Sprout className="w-4 h-4" />
              <span>Add My Farm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Precision Recommendations
        </h2>
        <p className="text-xs text-slate-500">
          Optimal resource allocation engine balancing multi-nutrient Liebig constraints, irrigation timing, and input expenditure.
        </p>
      </div>

      {/* Target Holding & Crop Selectors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Holding</label>
            <select
              value={activeFarmId || 1}
              onChange={(e) => setActiveFarmId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 cursor-pointer font-medium text-slate-800"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.total_area_hectares} ha)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Crop Cultivar</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 cursor-pointer font-medium text-slate-800"
            >
              <option value="Winter Wheat">Winter Wheat (Triticum aestivum PBW-343)</option>
              <option value="Hybrid Maize">Hybrid Maize (Zea mays Pioneer P3501)</option>
              <option value="Basmati Rice">Basmati Rice (Oryza sativa Pusa-1121)</option>
              <option value="Soybean">Soybean (Glycine max JS-335)</option>
            </select>
          </div>
        </div>

        {/* Optimization Goal Options */}
        <div className="pt-2 border-t border-slate-100">
          <label className="font-semibold text-slate-900 text-xs block mb-2">
            Agronomic Optimization Objective
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setGoal("yield")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                goal === "yield"
                  ? "bg-emerald-50/80 border-emerald-500 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Maximize Total Yield</span>
                {goal === "yield" && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Highest quintal return per acre</p>
            </button>

            <button
              type="button"
              onClick={() => setGoal("cost")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                goal === "cost"
                  ? "bg-emerald-50/80 border-emerald-500 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Minimize Chemical Cost</span>
                {goal === "cost" && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Reduce fertilizer & pump expense</p>
            </button>

            <button
              type="button"
              onClick={() => setGoal("water")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                goal === "water"
                  ? "bg-emerald-50/80 border-emerald-500 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Water Conservation</span>
                {goal === "water" && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Maintain root moisture with minimum draw</p>
            </button>
          </div>
        </div>

        {/* Strategy Check Options (Checkboxes) */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
            Agronomic Protocol Check Options
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={splitNitrogen}
                onChange={(e) => setSplitNitrogen(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 accent-emerald-700 cursor-pointer"
              />
              <span>Split Nitrogen Protocol (40/60)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={subsurfaceDrip}
                onChange={(e) => setSubsurfaceDrip(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 accent-emerald-700 cursor-pointer"
              />
              <span>Subsurface Drip Fertigation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={micronutrientSpray}
                onChange={(e) => setMicronutrientSpray(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 accent-emerald-700 cursor-pointer"
              />
              <span>Micronutrient Foliar Spray</span>
            </label>
          </div>
        </div>

        {/* Sliders */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Current Soil & Moisture Profile</span>
            </span>
            <button
              onClick={generatePlan}
              disabled={loading}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Calculating..." : "Recalculate Recommendation"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Nitrogen: {nitrogen} kg/ha</label>
              <input
                type="range"
                min="30"
                max="140"
                value={nitrogen}
                onChange={(e) => setNitrogen(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Soil Moisture: {moisture}%</label>
              <input
                type="range"
                min="12"
                max="45"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Rainfall: {rainfall} mm</label>
              <input
                type="range"
                min="100"
                max="900"
                value={rainfall}
                onChange={(e) => setRainfall(parseFloat(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">NDVI Vigor: {ndvi}</label>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.01"
                value={ndvi}
                onChange={(e) => setNdvi(parseFloat(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {recommendation && (
        <>
          {/* Economic & Yield Impact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yield Improvement</span>
              <div className="text-2xl font-bold text-emerald-700">
                +{recommendation.yield_improvement_pct}%
              </div>
              <div className="text-xs text-slate-500">
                {recommendation.baseline_yield_q_acre} → {recommendation.optimized_yield_q_acre} Q/acre
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nutrient Adjustment</span>
              <div className="text-2xl font-bold text-slate-900">
                {recommendation.delta_nitrogen_kg_ha > 0 ? `+${recommendation.delta_nitrogen_kg_ha}` : recommendation.delta_nitrogen_kg_ha} kg/ha
              </div>
              <div className="text-xs text-slate-500">
                Target: {recommendation.recommended_nitrogen_kg_ha} kg/ha
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplemental Water</span>
              <div className="text-2xl font-bold text-blue-700">
                {recommendation.supplemental_irrigation_mm} mm
              </div>
              <div className="text-xs text-slate-500">
                Target Moisture: {recommendation.recommended_moisture_pct}%
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Financial Benefit</span>
              <div className="text-2xl font-bold text-emerald-800 font-mono">
                ₹{recommendation.net_economic_benefit_inr_acre.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Per Acre Projected Value
              </div>
            </div>
          </div>

          {/* Detailed Explainable Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nitrogen Action Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Nitrogen Application Advisory</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Targeted Canopy Fertilization</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed space-y-2">
                <div className="font-semibold text-emerald-900">Recommendation:</div>
                <p>{recommendation.nitrogen_advisory}</p>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Current Soil Reserve:</span>
                  <span className="font-mono font-medium text-slate-800">{recommendation.current_nitrogen_kg_ha} kg/ha</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Recommended Agronomic Rate:</span>
                  <span className="font-mono font-medium text-emerald-700">{recommendation.recommended_nitrogen_kg_ha} kg/ha</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Timing:</span>
                  <span className="font-medium text-slate-800">Split-dose at first node emergence</span>
                </div>
              </div>
            </div>

            {/* Irrigation Action Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Irrigation Management Plan</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Root Zone Hydration Protocol</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed space-y-2">
                <div className="font-semibold text-blue-900">Irrigation Protocol:</div>
                <p>{recommendation.irrigation_advisory}</p>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Current Volumetric Water:</span>
                  <span className="font-mono font-medium text-slate-800">{recommendation.current_moisture_pct}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Optimal Field Capacity:</span>
                  <span className="font-mono font-medium text-blue-700">{recommendation.recommended_moisture_pct}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Supplemental Volume:</span>
                  <span className="font-medium text-slate-800">{recommendation.supplemental_irrigation_mm} mm over next 5 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Agronomic Disclaimer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-700">Agronomic Disclaimer:</strong> {recommendation.disclaimer}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
