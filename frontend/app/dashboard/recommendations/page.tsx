"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { api, RecommendationOutput } from "@/lib/api";

export default function RecommendationsPage() {
  const [nitrogen, setNitrogen] = useState<number>(75.0);
  const [moisture, setMoisture] = useState<number>(24.0);
  const [rainfall, setRainfall] = useState<number>(420.0);
  const [ndvi, setNdvi] = useState<number>(0.68);
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
        crop_type: "Winter Wheat",
      });
      setRecommendation(rec);
    } catch (err) {
      console.warn("Recommendation calculation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generatePlan();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Precision Agronomy Decision Support System
        </h1>
        <p className="text-xs text-slate-500">
          Optimal resource allocation engine balancing multi-nutrient Liebig constraints, irrigation timing, and input expenditure.
        </p>
      </div>

      {/* Interactive Agronomic Scenario Adjuster */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>Target Plot Soil & Moisture Profile</span>
          </span>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Re-optimizing..." : "Re-calculate Recommendations"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Nitrogen Level: {nitrogen} kg/ha</label>
            <input
              type="range"
              min="30"
              max="140"
              value={nitrogen}
              onChange={(e) => setNitrogen(parseFloat(e.target.value))}
              className="w-full accent-emerald-700"
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
              className="w-full accent-emerald-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Seasonal Rainfall: {rainfall} mm</label>
            <input
              type="range"
              min="100"
              max="900"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full accent-blue-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Canopy NDVI: {ndvi}</label>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.01"
              value={ndvi}
              onChange={(e) => setNdvi(parseFloat(e.target.value))}
              className="w-full accent-blue-700"
            />
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
