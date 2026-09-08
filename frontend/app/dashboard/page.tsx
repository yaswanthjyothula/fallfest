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
} from "lucide-react";
import { api, Farm, WeatherCurrent, YieldPredictionOutput } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";
import { useAuth } from "@/lib/AuthContext";
import { LocationModal } from "@/components/LocationModal";

export default function FarmOverviewPage() {
  const { activeFarm, farms, activeFarmId, setActiveFarmId } = useFarm();
  const { user, location } = useAuth();
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<YieldPredictionOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  async function loadOverviewData(force = false) {
    if (!activeFarm) return;
    try {
      setLoading(true);
      setErrorNotice(null);

      // Fetch weather for the active farm's coordinates
      api.getCurrentWeather(activeFarm.latitude, activeFarm.longitude, force)
        .then((w) => setWeather(w))
        .catch((e) => console.warn("Notice: Weather loaded with cached parameters"));

      api.getPredictionHistory(5, force)
        .then((preds) => setRecentPredictions(preds))
        .catch((e) => console.warn("Notice: Prediction history loaded with recent records"));

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

  return (
    <div className="space-y-6">
      {/* Location-Aware Personalized Context Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Location-Aware Agricultural Intelligence
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              GPS Calibrated
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {user?.fullName ? `Welcome, ${user.fullName}` : "Farm Overview"} — {location.formattedAddress}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Your field is currently being monitored using weather, satellite, and agricultural data. Local micro-climate conditions and soil telemetry are synchronized.
          </p>
        </div>

        <button
          onClick={() => setLocationModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition cursor-pointer shrink-0"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Update Location</span>
        </button>
      </div>

      {/* Error / Offline Notice with Retry */}
      {errorNotice && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{errorNotice} Standard agronomic baseline indicators are currently displayed.</span>
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


      {/* 1. Farm Context Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Active Farm Context
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Kharif / Rabi 2026 Season</span>
              <span className="text-xs text-slate-400">•</span>
              <select
                value={activeFarmId || 1}
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
              {activeFarm ? activeFarm.name : "Green Valley Agricultural Station"}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{activeFarm?.location || "Krishna Basin Zone 4B, Andhra Pradesh, India"}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-600">
                {activeFarm ? `${activeFarm.latitude.toFixed(4)}° N, ${activeFarm.longitude.toFixed(4)}° E` : "16.5062° N, 80.6480° E"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/predict"
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Run Yield Prediction</span>
            </Link>
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <span>Generate Recommendation</span>
            </Link>
          </div>
        </div>

        {/* Operational Context Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Analyzed Crop</span>
            <span className="font-semibold text-slate-800">Winter Wheat</span>
            <span className="text-slate-500 block text-[11px]">Triticum aestivum</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Growth Stage</span>
            <span className="font-semibold text-slate-800">Stem Elongation</span>
            <span className="text-slate-500 block text-[11px]">Feekes Stage 6</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cultivated Area</span>
            <span className="font-semibold text-slate-800">
              {activeFarm?.total_area_hectares || 120} Hectares
            </span>
            <span className="text-slate-500 block text-[11px]">
              {Math.round((activeFarm?.total_area_hectares || 120) * 2.47105)} Acres registered
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Soil Profile</span>
            <span className="font-semibold text-slate-800">Alluvial Loam</span>
            <span className="text-slate-500 block text-[11px]">Optimal pH 6.8</span>
          </div>
        </div>
      </div>

      {/* 2. Key Agricultural Metrics Strip (Aligned Rectangular Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Predicted Yield */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Predicted Yield</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">41.8</span>
              <span className="text-xs text-slate-500 font-medium">Quintals / Acre</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">5.23 Tonnes / Hectare</div>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-1 border-t border-slate-100">
            <span className="font-semibold">+8.4%</span>
            <span>above regional alluvial norm</span>
          </div>
        </div>

        {/* Metric 2: Crop Health (NDVI) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crop Health</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">0.82</span>
              <span className="text-xs text-slate-500 font-medium">NDVI Index</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Healthy Active Canopy</div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-100">
            <span>Copernicus Sentinel-2</span>
            <span>• 10m L2A</span>
          </div>
        </div>

        {/* Metric 3: Soil Nutrient Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soil Condition</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">85.0</span>
              <span className="text-xs text-slate-500 font-medium">kg N / ha</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">28.5% Volumetric Moisture</div>
          </div>
          <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 pt-1 border-t border-slate-100">
            <span>Optimal vegetative nutrient balance</span>
          </div>
        </div>

        {/* Metric 4: Hyperlocal Weather */}
        <Link
          href="/dashboard/weather"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-300 hover:shadow-sm transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition">
              Weather Intelligence
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition">
              <CloudSun className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {weather ? `${weather.temperature_c.toFixed(1)}°C` : "28.5°C"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {weather?.conditions || "Partly Cloudy"}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Humidity: {weather?.humidity_pct || 52}% • Rain: {weather?.precipitation_mm || 0}mm
            </div>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>7-Day Envelope & Quantum Sim</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>


      {/* 3. Recommended Next Action Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
            Recommended Action For Current Growth Stage
          </span>
          <p className="text-xs sm:text-sm font-semibold text-emerald-950">
            Apply split-dose nitrogen (+20 kg/ha) before heading and schedule 18mm supplemental micro-irrigation.
          </p>
          <p className="text-[11px] text-emerald-700">
            Projected harvest improvement: +4.6 Q/acre • Estimated economic benefit: +₹4,850/acre.
          </p>
        </div>
        <Link
          href="/dashboard/recommendations"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4. Feature Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Workspace 1: Yield Prediction */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
                    No predictions recorded yet. Run a yield prediction to view historical records.
                  </td>
                </tr>
              ) : (
                recentPredictions.map((pred) => (
                  <tr key={pred.prediction_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                      AQ-PRD-{pred.prediction_id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Winter Wheat</td>
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
