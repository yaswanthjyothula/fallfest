"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useFarm } from "@/lib/FarmContext";
import {
  Sparkles,
  Sliders,
  TrendingUp,
  DollarSign,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ScenarioResult {
  scenario_id: string;
  scenario_name: string;
  description: string;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  moisture_pct: number;
  irrigation_mm: number;
  predicted_yield_q_acre: number;
  predicted_yield_t_ha: number;
  input_cost_inr_acre: number;
  estimated_revenue_inr_acre: number;
  net_profit_inr_acre: number;
  savings_vs_baseline_inr_acre: number;
  water_stress_index: number;
  risk_tier: string;
}

export default function ScenariosPage() {
  const { activeFarm } = useFarm();

  // Controllable input states
  const [crop, setCrop] = useState("Paddy (Rice)");
  const [area, setArea] = useState<number>(10);
  const [nitrogen, setNitrogen] = useState<number>(90);
  const [phosphorus, setPhosphorus] = useState<number>(42);
  const [potassium, setPotassium] = useState<number>(42);
  const [moisture, setMoisture] = useState<number>(55);
  const [soilPh, setSoilPh] = useState<number>(6.8);
  const [rainfall, setRainfall] = useState<number>(210);
  const [temperature, setTemperature] = useState<number>(28.5);
  const [ndvi, setNdvi] = useState<number>(0.68);

  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>("optimized");
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        crop,
        area: Number(area),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        soil_moisture: Number(moisture),
        soil_ph: Number(soilPh),
        rainfall: Number(rainfall),
        temperature: Number(temperature),
        ndvi: Number(ndvi),
      };

      const res = await fetch("http://localhost:8000/api/v1/simulations/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Simulation failed");
      const data = await res.json();
      setScenarios(data.scenarios);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const getRiskBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "low risk":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "moderate risk":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  // ECharts options comparing the 4 scenarios
  const chartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Predicted Yield (t/ha)", "Input Cost (₹/acre)", "Net Margin (₹/acre)"],
      bottom: 0,
      textStyle: { fontSize: 11, color: "#475569" },
    },
    grid: { left: "3%", right: "4%", bottom: "14%", top: "8%", containLabel: true },
    xAxis: {
      type: "category",
      data: scenarios.map((s) => s.scenario_name.replace(" Plan", "")),
      axisLabel: { fontSize: 11, color: "#334155", fontWeight: "bold" },
    },
    yAxis: [
      {
        type: "value",
        name: "Yield (t/ha)",
        min: 0,
        max: 6,
        axisLabel: { formatter: "{value} t" },
      },
      {
        type: "value",
        name: "Financials (₹)",
        min: 0,
        axisLabel: { formatter: "₹{value}" },
      },
    ],
    series: [
      {
        name: "Predicted Yield (t/ha)",
        type: "bar",
        data: scenarios.map((s) => s.predicted_yield_t_ha),
        itemStyle: { color: "#15803d", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Input Cost (₹/acre)",
        type: "bar",
        yAxisIndex: 1,
        data: scenarios.map((s) => s.input_cost_inr_acre),
        itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Net Margin (₹/acre)",
        type: "bar",
        yAxisIndex: 1,
        data: scenarios.map((s) => s.net_profit_inr_acre),
        itemStyle: { color: "#0284c7", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const handleApplyScenario = (sc: ScenarioResult) => {
    setSelectedScenario(sc.scenario_id);
    setNitrogen(sc.nitrogen_kg_ha);
    setPhosphorus(sc.phosphorus_kg_ha);
    setPotassium(sc.potassium_kg_ha);
    setMoisture(sc.moisture_pct);
    setAppliedMsg(`Applied ${sc.scenario_name} to field parameters!`);
    setTimeout(() => setAppliedMsg(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Signature AgriQuantum Capability
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            What-If Agricultural Decision Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Modify controllable inputs and observe live model-projected outcomes.
            Compare Baseline, Precision-Optimized, Cost-Constrained, and Yield-Push plans with real economics.
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Simulating Scenarios..." : "Re-simulate Scenarios"}</span>
        </button>
      </div>

      {/* Interactive Controls & Parameter Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Controllable Field Variables
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Active Farm: <b>{activeFarm?.name || "Demo Plot"}</b>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Nitrogen Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Nitrogen (N)</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                {nitrogen} kg/ha
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="220"
              step="5"
              value={nitrogen}
              onChange={(e) => setNitrogen(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30 (Low)</span>
              <span>120 (Standard)</span>
              <span>220 (Excess)</span>
            </div>
          </div>

          {/* Phosphorus Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Phosphorus (P)</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                {phosphorus} kg/ha
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="2"
              value={phosphorus}
              onChange={(e) => setPhosphorus(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10 kg/ha</span>
              <span>50 kg/ha</span>
              <span>100 kg/ha</span>
            </div>
          </div>

          {/* Potassium Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Potassium (K)</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                {potassium} kg/ha
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="2"
              value={potassium}
              onChange={(e) => setPotassium(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10 kg/ha</span>
              <span>50 kg/ha</span>
              <span>100 kg/ha</span>
            </div>
          </div>

          {/* Soil Moisture / Irrigation Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Soil Moisture (Irrigation)</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                {moisture}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="85"
              step="1"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20% (Dry)</span>
              <span>55% (Optimal)</span>
              <span>85% (Saturated)</span>
            </div>
          </div>
        </div>

        {/* Action Button & Applied Feedback */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {appliedMsg && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {appliedMsg}
              </span>
            )}
          </div>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compute Scenarios</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side 4 Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.scenario_id;
          const isOptimized = sc.scenario_id === "optimized";

          return (
            <div
              key={sc.scenario_id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between relative ${
                isOptimized
                  ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : isSelected
                  ? "border-blue-500 shadow-xs"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isOptimized && (
                <div className="absolute -top-3 left-4 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" /> Recommended
                </div>
              )}

              <div className="space-y-4">
                {/* Title & Risk Badge */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{sc.scenario_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sc.description}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getRiskBadge(
                      sc.risk_tier
                    )}`}
                  >
                    {sc.risk_tier}
                  </span>
                </div>

                {/* Primary Metric: Yield */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Predicted Yield
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold text-emerald-800">
                      {sc.predicted_yield_t_ha}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">t/ha</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({sc.predicted_yield_q_acre} quintals / acre)
                  </span>
                </div>

                {/* Economic Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" /> Input Cost:
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{sc.input_cost_inr_acre.toLocaleString()}/ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" /> Est. Revenue:
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{sc.estimated_revenue_inr_acre.toLocaleString()}/ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Net Profit Margin:</span>
                    <span className="font-bold text-emerald-700">
                      ₹{sc.net_profit_inr_acre.toLocaleString()}/ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Savings vs Baseline:</span>
                    <span
                      className={`font-semibold ${
                        sc.savings_vs_baseline_inr_acre >= 0
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {sc.savings_vs_baseline_inr_acre >= 0 ? "+" : ""}
                      ₹{sc.savings_vs_baseline_inr_acre.toLocaleString()}/ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" /> Irrigation:
                    </span>
                    <span className="font-mono text-slate-700">
                      {sc.irrigation_mm} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => handleApplyScenario(sc)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isOptimized
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>Select & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Visual Analytics Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Scenario Comparative Performance (Yield vs Financials)
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluated with live Quantum SVR inference engine against baseline agronomic targets.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" /> Yield
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Input Cost
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Net Margin
          </div>
        </div>

        <div className="h-72 w-full">
          {scenarios.length > 0 ? (
            <ReactECharts option={chartOption} style={{ height: "100%", width: "100%" }} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Generating comparative model charts...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
