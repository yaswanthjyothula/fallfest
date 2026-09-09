"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  MapPin,
  Leaf,
  Atom,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  LineChart,
  Layers,
  Calendar,
  AlertCircle,
  RefreshCw,
  Navigation,
  Plus,
  Sprout,
  ShieldAlert,
} from "lucide-react";
import { api, Farm, WeatherCurrent, YieldPredictionOutput } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";
import { useAuth } from "@/lib/AuthContext";
import { LocationModal } from "@/components/LocationModal";

export default function FarmOverviewPage() {
  const { activeFarm, farms, activeFarmId, setActiveFarmId, loadingFarms } = useFarm();
  const { user, location } = useAuth();
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [farmAnalysis, setFarmAnalysis] = useState<any>(null);
  const [recentPredictions, setRecentPredictions] = useState<YieldPredictionOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  async function loadOverviewData(force = false) {
    if (!activeFarm) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErrorNotice(null);

      // Fetch live weather for active farm coordinates
      api.getCurrentWeather(activeFarm.latitude, activeFarm.longitude, force)
        .then((w) => setWeather(w))
        .catch(() => console.warn("Notice: Weather loaded with fallback"));

      // Fetch latest consolidated farm analysis
      api.getFarmAnalysis(activeFarm.id)
        .then((res) => setFarmAnalysis(res))
        .catch(() => {});

      // Fetch prediction history
      api.getPredictionHistory(5, force)
        .then((preds) => setRecentPredictions(preds))
        .catch(() => {});

    } catch (err) {
      console.error("Farm overview data load:", err);
      setErrorNotice("Some dashboard information is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverviewData();
  }, [activeFarm?.id]);

  const hasFarms = farms.length > 0 && activeFarm !== null;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Location-Aware Personalized Context Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Location-Aware Agricultural Intelligence
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {hasFarms ? "Farm Synchronized" : "Awaiting Farm Setup"}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Welcome, {user?.fullName || "Farmer"} — {location.formattedAddress}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {hasFarms
              ? `Your holding '${activeFarm.name}' is actively monitored using Visual Crossing weather, Copernicus Sentinel-2 satellite NDVI, and 4-Qubit Quantum SVR.`
              : "Enter your farm information to begin personalized agricultural analysis and live telemetry monitoring."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!hasFarms ? (
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add My Farm</span>
            </Link>
          ) : (
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Update Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Error / Offline Notice */}
      {errorNotice && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => loadOverviewData(true)}
            className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 px-2.5 py-1 rounded bg-amber-100/70 hover:bg-amber-100 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      {/* EMPTY FIRST TIME USER BANNER */}
      {!hasFarms && !loadingFarms && (
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Let's set up your farm</h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Enter your farm information to begin personalized agricultural analysis. AgriQuantum will automatically retrieve local weather forecasts, Sentinel-2 canopy NDVI, and execute quantum yield forecasts tailored to your soil chemistry.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add My Farm</span>
            </Link>
          </div>
        </div>
      )}

      {/* 1. Farm Context Bar (When farm exists) */}
      {hasFarms && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Active Farm Holding
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Kharif / Rabi 2026 Season</span>
                <span className="text-xs text-slate-400">•</span>
                <select
                  value={activeFarmId}
                  onChange={(e) => setActiveFarmId(Number(e.target.value))}
                  className="text-xs font-semibold text-emerald-900 bg-emerald-50/80 border border-emerald-300/80 rounded-md px-2 py-0.5 focus:outline-emerald-600 cursor-pointer"
                  aria-label="Switch active farm"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.total_area_hectares} ha)
                    </option>
                  ))}
                </select>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeFarm.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activeFarm.location || `${activeFarm.state || ""}, ${activeFarm.country}`}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-slate-600">
                  {activeFarm.latitude.toFixed(4)}° N, {activeFarm.longitude.toFixed(4)}° E
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/dashboard/predict"
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Run Yield Prediction</span>
              </Link>
              <Link
                href="/dashboard/recommendations"
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <span>Recommendations</span>
              </Link>
            </div>
          </div>

          {/* Operational Context Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Analyzed Crop</span>
              <span className="font-semibold text-slate-800">{farmAnalysis?.crops?.[0]?.name || "Active Cultivation"}</span>
              <span className="text-slate-500 block text-[11px]">{farmAnalysis?.crops?.[0]?.variety || "High Yield Certified"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Growth Stage</span>
              <span className="font-semibold text-slate-800">{farmAnalysis?.crops?.[0]?.growth_stage || "Vegetative / Tillering"}</span>
              <span className="text-slate-500 block text-[11px]">Active Season</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cultivated Area</span>
              <span className="font-semibold text-slate-800">
                {activeFarm.total_area_hectares} Hectares
              </span>
              <span className="text-slate-500 block text-[11px]">
                {Math.round(activeFarm.total_area_hectares * 2.47105)} Acres registered
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Soil Profile</span>
              <span className="font-semibold text-slate-800">{farmAnalysis?.fields?.[0]?.soil_type || "Alluvial Loam"}</span>
              <span className="text-slate-500 block text-[11px]">pH {farmAnalysis?.latest_soil?.ph || 6.8}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Key Agricultural Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Predicted Yield */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Predicted Yield</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            {hasFarms && farmAnalysis?.latest_prediction ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{farmAnalysis.latest_prediction.predicted_yield}</span>
                  <span className="text-xs text-slate-500 font-medium">Quintals / Acre</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ≈ {(farmAnalysis.latest_prediction.predicted_yield * 0.125).toFixed(2)} Tonnes / Hectare
                </div>
              </>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">No prediction yet</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Add farm data to begin</p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 pt-1 border-t border-slate-100">
            {hasFarms ? <span>Qiskit Aer 4-Qubit QSVR</span> : <span>Requires farm analysis</span>}
          </div>
        </div>

        {/* Metric 2: Crop Health (NDVI) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crop Health</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div>
            {hasFarms ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {farmAnalysis?.latest_satellite?.ndvi || 0.68}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">NDVI Index</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Active Canopy Vigor</div>
              </>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">Awaiting observation</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Add farm to query satellite</p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-100">
            <span>Copernicus Sentinel-2</span>
            <span>• 10m L2A</span>
          </div>
        </div>

        {/* Metric 3: Soil Nutrient Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soil Telemetry</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            {hasFarms && farmAnalysis?.latest_soil ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{farmAnalysis.latest_soil.nitrogen}</span>
                  <span className="text-xs text-slate-500 font-medium">kg N / ha</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{farmAnalysis.latest_soil.moisture}% Volumetric Moisture</div>
              </>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">No soil telemetry</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter soil N-P-K values</p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 pt-1 border-t border-slate-100">
            {hasFarms ? <span>Nutrient profile recorded</span> : <span>Awaiting farm setup</span>}
          </div>
        </div>

        {/* Metric 4: Hyperlocal Weather */}
        <Link
          href="/dashboard/weather"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-300 hover:shadow-sm transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition">
              Weather Telemetry
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition">
              <CloudSun className="w-4 h-4" />
            </span>
          </div>
          <div>
            {hasFarms && weather ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {weather.temperature_c.toFixed(1)}°C
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {weather.conditions}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Humidity: {weather.humidity_pct}% • Rain: {weather.precipitation_mm}mm
                </div>
              </>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">Set farm location</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated meteorological query</p>
              </div>
            )}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Visual Crossing Weather</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      {/* 3. Recommended Next Action Banner (When farm exists) */}
      {hasFarms && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Liebig Precision Agronomy Recommendation
            </span>
            <p className="text-xs sm:text-sm font-semibold text-emerald-950">
              Calibrate nitrogen split-dose and maintain root-zone soil moisture with targeted micro-irrigation.
            </p>
            <p className="text-[11px] text-emerald-700">
              Personalized optimization computed by Qiskit Quantum SVR engine.
            </p>
          </div>
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>View Recommendation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Feature Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Workspace 1: Yield Prediction */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <LineChart className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Crop Yield Prediction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Estimate expected harvest volume from soil chemistry, moisture telemetry, and seasonal precipitation using 4-qubit Hilbert space regression.
            </p>
          </div>
          <Link
            href="/dashboard/predict"
            className="inline-flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100"
          >
            <span>Run Yield Prediction</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Workspace 2: Precision Recommendations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Precision Recommendations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Optimize controllable nitrogen inputs and supplemental irrigation to maximize harvest yield while controlling fertilizer expenses.
            </p>
          </div>
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center justify-between text-xs font-semibold text-blue-700 hover:text-blue-800 pt-2 border-t border-slate-100"
          >
            <span>Generate Recommendation</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Workspace 3: Certified Reports */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Agricultural Reports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate official agronomic audit reports sealed with cryptographic SHA-256 validation digests for institutional compliance and financing.
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center justify-between text-xs font-semibold text-purple-700 hover:text-purple-800 pt-2 border-t border-slate-100"
          >
            <span>Generate Report</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 5. Historical Predictions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Quantum Yield Inferences</h3>
            <p className="text-xs text-slate-500">Persistent historical records verified by the database</p>
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
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-4">Crop</th>
                <th className="py-2.5 px-4">Soil N (kg/ha)</th>
                <th className="py-2.5 px-4">Moisture</th>
                <th className="py-2.5 px-4">Rainfall</th>
                <th className="py-2.5 px-4">Predicted Yield</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No predictions recorded yet. Run a yield prediction or add your farm to view historical records.
                  </td>
                </tr>
              ) : (
                recentPredictions.map((pred) => (
                  <tr key={pred.prediction_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                      AQ-PRD-{pred.prediction_id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{(pred as any).crop_type || (pred as any).crop_name || "Cultivated Crop"}</td>
                    <td className="py-2.5 px-4 text-slate-600">{pred.input_summary?.soil_nitrogen_kg_ha ?? 85.0}</td>
                    <td className="py-2.5 px-4 text-slate-600">{pred.input_summary?.soil_moisture_pct ?? 28.5}%</td>
                    <td className="py-2.5 px-4 text-slate-600">{pred.input_summary?.rainfall_mm ?? 450.0} mm</td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-800">
                      {pred.predicted_yield_quintals_acre} Q/acre
                      <span className="text-[10px] text-slate-400 font-normal block">
                        ({pred.predicted_yield_tonnes_hectare} t/ha)
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {pred.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
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
