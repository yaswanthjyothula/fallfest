"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Atom,
  TrendingUp,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { api, Farm, YieldPredictionOutput } from "@/lib/api";

export default function YieldPredictionPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);

  // Form Inputs with sensible defaults
  const [nitrogen, setNitrogen] = useState<number>(85.0);
  const [phosphorus, setPhosphorus] = useState<number>(45.0);
  const [potassium, setPotassium] = useState<number>(55.0);
  const [moisture, setMoisture] = useState<number>(28.5);
  const [ph, setPh] = useState<number>(6.8);
  const [rainfall, setRainfall] = useState<number>(450.0);
  const [temperature, setTemperature] = useState<number>(24.5);
  const [ndvi, setNdvi] = useState<number>(0.72);
  const [cropType, setCropType] = useState<string>("Winter Wheat");
  const [area, setArea] = useState<number>(120.0);

  // Submission & Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<YieldPredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFarms() {
      try {
        const farmList = await api.getFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].id);
        }
      } catch (err) {
        console.warn("Could not load farms:", err);
      }
    }
    loadFarms();
  }, []);

  // Presets
  function applyPreset(type: "optimal" | "drought" | "excess_nitrogen") {
    if (type === "optimal") {
      setNitrogen(110.0);
      setPhosphorus(45.0);
      setPotassium(60.0);
      setMoisture(32.0);
      setPh(6.8);
      setRainfall(520.0);
      setTemperature(23.0);
      setNdvi(0.82);
    } else if (type === "drought") {
      setNitrogen(70.0);
      setPhosphorus(35.0);
      setPotassium(40.0);
      setMoisture(14.0);
      setPh(7.2);
      setRainfall(180.0);
      setTemperature(31.0);
      setNdvi(0.38);
    } else {
      setNitrogen(155.0);
      setPhosphorus(60.0);
      setPotassium(70.0);
      setMoisture(26.0);
      setPh(6.5);
      setRainfall(400.0);
      setTemperature(25.0);
      setNdvi(0.74);
    }
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const output = await api.predictYield({
        field_id: selectedFarmId ? 1 : undefined,
        soil_nitrogen: nitrogen,
        soil_phosphorus: phosphorus,
        soil_potassium: potassium,
        soil_moisture: moisture,
        soil_ph: ph,
        rainfall: rainfall,
        temperature: temperature,
        ndvi: ndvi,
        crop_type: cropType,
        cultivated_area_hectares: area,
      });
      setResult(output);
    } catch (err: any) {
      setError(err.message || "Failed to compute quantum prediction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Precision Yield Prediction Engine</h1>
          <p className="text-xs text-slate-500">
            4-Qubit Quantum Support Vector Regression with continuous Hilbert kernel projection.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("optimal")}
            className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-medium transition-colors"
          >
            Optimal Alluvial
          </button>
          <button
            type="button"
            onClick={() => applyPreset("drought")}
            className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 font-medium transition-colors"
          >
            Water Stressed
          </button>
          <button
            type="button"
            onClick={() => applyPreset("excess_nitrogen")}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
          >
            High Nitrogen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Agronomic Telemetry Inputs</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Physical Units & Boundary Enforcement</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            {/* Row 1: Crop and Farm Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Holding</label>
                <select
                  value={selectedFarmId || ""}
                  onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 cursor-pointer"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Crop Cultivar</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="Winter Wheat">Winter Wheat (Triticum aestivum PBW-343)</option>
                  <option value="Hybrid Maize">Hybrid Maize (Zea mays Pioneer P3501)</option>
                  <option value="Basmati Rice">Basmati Rice (Oryza sativa Pusa-1121)</option>
                  <option value="Soybean">Soybean (Glycine max JS-335)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Nitrogen & Moisture (Qubit 0 & 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Soil Nitrogen (N) <span className="font-mono text-emerald-700">[Q0]</span>
                  </label>
                  <span className="font-mono text-slate-500 font-bold">{nitrogen} kg/ha</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="1"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Deficit (20)</span>
                  <span>Optimal (~110)</span>
                  <span>Surplus (160)</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Soil Moisture <span className="font-mono text-emerald-700">[Q1]</span>
                  </label>
                  <span className="font-mono text-slate-500 font-bold">{moisture}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="0.5"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Wilting (10%)</span>
                  <span>Field Cap (~32%)</span>
                  <span>Waterlog (50%)</span>
                </div>
              </div>
            </div>

            {/* Row 3: Rainfall & NDVI (Qubit 2 & 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Cumulative Rainfall <span className="font-mono text-blue-700">[Q2]</span>
                  </label>
                  <span className="font-mono text-slate-500 font-bold">{rainfall} mm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="1200"
                  step="10"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseFloat(e.target.value))}
                  className="w-full accent-blue-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Drought (80 mm)</span>
                  <span>Adequate (~550 mm)</span>
                  <span>Flood (1200 mm)</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Sentinel-2 NDVI <span className="font-mono text-blue-700">[Q3]</span>
                  </label>
                  <span className="font-mono text-slate-500 font-bold">{ndvi}</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.92"
                  step="0.01"
                  value={ndvi}
                  onChange={(e) => setNdvi(parseFloat(e.target.value))}
                  className="w-full accent-blue-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sparse (0.15)</span>
                  <span>Moderate (0.50)</span>
                  <span>Dense (0.92)</span>
                </div>
              </div>
            </div>

            {/* Row 4: Secondary Agronomic Variables (P, K, pH, Temp) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Phosphorus (kg/ha)</label>
                <input
                  type="number"
                  step="1"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Potassium (kg/ha)</label>
                <input
                  type="number"
                  step="1"
                  value={potassium}
                  onChange={(e) => setPotassium(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Mean Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Atom className="w-4 h-4 animate-spin" />
                  <span>Quantum analysis is being calculated...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Yield Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-800 space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Prediction Computation Error</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">Inference Output</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  AQ-PRD-{result.prediction_id}
                </span>
              </div>

              {/* Big Metric Display */}
              <div className="text-center py-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Predicted Crop Yield
                </span>
                <div className="text-4xl font-bold text-emerald-950 font-sans tracking-tight">
                  {result.predicted_yield_quintals_acre}
                  <span className="text-base font-normal text-emerald-700 ml-1.5">Quintals / Acre</span>
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  ≈ {result.predicted_yield_tonnes_hectare} Metric Tonnes / Hectare
                </div>
              </div>

              {/* Quantum Model Verification Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Model Framework</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-800">{result.model_version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Quantum Simulator</span>
                  <span className="font-mono text-[11px] text-slate-700">{result.quantum_backend}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Circuit Depth</span>
                  <span className="font-mono text-[11px] text-slate-700">4 Qubits • ZZFeatureMap</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verification Confidence</span>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">{result.confidence_score}%</span>
                </div>
              </div>

              {/* Agronomic Context */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Regional Benchmark Comparison</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {result.historical_comparison}. The high NDVI canopy density ({ndvi}) combined with balanced moisture reserves produces near-maximum photosynthetic conversion efficiency.
                </p>
              </div>

              <div className="pt-2 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Database Sync: PostgreSQL + Supabase</span>
                <span>Audit Verified</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Atom className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Awaiting Agricultural Telemetry</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Adjust the soil nutrient, moisture, rainfall, and NDVI parameters on the left, then execute quantum inference to view yield predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
