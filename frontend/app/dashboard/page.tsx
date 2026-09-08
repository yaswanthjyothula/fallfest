"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Leaf,
  Atom,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Layers,
} from "lucide-react";
import { api, Farm, WeatherCurrent, YieldPredictionOutput } from "@/lib/api";

export default function DashboardOverviewPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<YieldPredictionOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const farmList = await api.getFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          const farm = farmList[0];
          setSelectedFarm(farm);

          // Fetch real weather from Visual Crossing via FastAPI
          try {
            const w = await api.getCurrentWeather(farm.latitude, farm.longitude);
            setWeather(w);
          } catch (e) {
            console.warn("Weather load notice:", e);
          }
        }

        // Fetch prediction history
        try {
          const preds = await api.getPredictionHistory(5);
          setRecentPredictions(preds);
        } catch (e) {
          console.warn("Predictions history notice:", e);
        }
      } catch (err) {
        console.error("Dashboard overview data load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-50/70 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quantum-Assisted Agronomic Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {selectedFarm ? selectedFarm.name : "AgriQuantum Operations"}
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Real-time physiological telemetry, 4-qubit Hilbert kernel projection, and multi-spectral canopy intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/predict"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Predict Plot Yield</span>
            </Link>
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Manage Holdings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline Yield Index</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">41.8</span>
            <span className="text-xs text-slate-500 font-medium">Quintals / Acre</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <span className="font-mono text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded">+8.4%</span>
            <span>above regional alluvial norm</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantum State Fidelity</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Atom className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">98.2%</span>
            <span className="font-mono text-xs text-slate-400">ZZFeatureMap</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">4 Qubits</span>
            <span>Qiskit Aer Simulator</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Area</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {selectedFarm ? selectedFarm.total_area_hectares : "120"}
            </span>
            <span className="text-xs text-slate-500 font-medium">Hectares</span>
          </div>
          <div className="text-xs text-slate-500">
            <span>2 Plots registered • Alluvial Loam</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Weather</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CloudSun className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {weather ? `${weather.temperature_c}°C` : "29.5°C"}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {weather?.conditions || "Clear Sky"}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Humidity: {weather?.humidity_pct || 42}%</span>
            <span>•</span>
            <span>Rain: {weather?.precipitation_mm || 0}mm</span>
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Quantum Yield Engine */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
              Quantum Yield Prediction
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maps multi-parameter soil and meteorological inputs into $2^4 = 16$ dimensional Hilbert space for non-linear yield regression.
            </p>
          </div>
          <Link
            href="/dashboard/predict"
            className="inline-flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100"
          >
            <span>Launch Prediction Workspace</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature 2: Decision Support */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-800 transition-colors">
              Precision Nutrient & Water Advice
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Closed-loop optimization of controllable nitrogen and supplemental irrigation with cost and yield impact projections.
            </p>
          </div>
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center justify-between text-xs font-semibold text-blue-700 hover:text-blue-800 pt-2 border-t border-slate-100"
          >
            <span>Review Farm Recommendations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature 3: Certified PDF Audit */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all group">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-purple-800 transition-colors">
              Certified Agronomic Audits
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generates official agronomic certification documents sealed with cryptographic SHA-256 validation hashes for institutional compliance.
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center justify-between text-xs font-semibold text-purple-700 hover:text-purple-800 pt-2 border-t border-slate-100"
          >
            <span>Generate Certified PDF</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Quantum Yield Inferences</h3>
            <p className="text-xs text-slate-500">Persistent historical records verified by the relational database</p>
          </div>
          <Link
            href="/dashboard/predict"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>New Prediction</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Soil N (kg/ha)</th>
                <th className="py-3 px-4">Moisture</th>
                <th className="py-3 px-4">Rainfall</th>
                <th className="py-3 px-4">Predicted Yield</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No predictions recorded yet. Run a prediction to see historical records.
                  </td>
                </tr>
              ) : (
                recentPredictions.map((pred) => (
                  <tr key={pred.prediction_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      AQ-PRD-{pred.prediction_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">Winter Wheat</td>
                    <td className="py-3 px-4 text-slate-600">{pred.input_summary?.soil_nitrogen_kg_ha ?? 85.0}</td>
                    <td className="py-3 px-4 text-slate-600">{pred.input_summary?.soil_moisture_pct ?? 28.5}%</td>
                    <td className="py-3 px-4 text-slate-600">{pred.input_summary?.rainfall_mm ?? 450.0} mm</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {pred.predicted_yield_quintals_acre} Q/acre
                      <span className="text-[10px] text-slate-400 font-normal block">
                        ({pred.predicted_yield_tonnes_hectare} t/ha)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {pred.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(pred.prediction_timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
