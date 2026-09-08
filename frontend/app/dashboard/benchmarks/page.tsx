"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  CheckCircle2,
  Atom,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Cpu,
  Layers,
  FlaskConical,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sliders,
  ChevronDown,
} from "lucide-react";
import {
  api,
  BenchmarkResponse,
  ModelEvaluationMetricItem,
  BenchmarkScatterPoint,
  BenchmarkResidualPoint,
} from "@/lib/api";

export default function ModelBenchmarksPage() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [benchmarkStatusMsg, setBenchmarkStatusMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Selected models for interactive diagnostic plots
  const [scatterModel, setScatterModel] = useState<string>("Quantum SVR (QSVR)");
  const [residualModel, setResidualModel] = useState<string>("Quantum SVR (QSVR)");

  // ECharts DOM refs
  const r2ChartRef = useRef<HTMLDivElement>(null);
  const rmseChartRef = useRef<HTMLDivElement>(null);
  const maeChartRef = useRef<HTMLDivElement>(null);
  const scatterChartRef = useRef<HTMLDivElement>(null);
  const residualChartRef = useRef<HTMLDivElement>(null);
  const timingChartRef = useRef<HTMLDivElement>(null);

  const echartsInstances = useRef<{ [key: string]: any }>({});

  // 1. Initial Load
  useEffect(() => {
    loadBenchmarkData(false);
  }, []);

  async function loadBenchmarkData(forceRefresh = false) {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBenchmarks(forceRefresh);
      setBenchmarkData(data);
    } catch (err: any) {
      console.error("Failed to load benchmarks:", err);
      setError(err?.message || "Failed to load benchmark evaluation data.");
    } finally {
      setLoading(false);
    }
  }

  // 2. Trigger On-Demand Benchmark Re-run
  async function handleRunBenchmark() {
    try {
      setRunningBenchmark(true);
      setBenchmarkStatusMsg("Initializing 4-Qubit ZZFeatureMap & Train/Test Splits...");
      await new Promise((r) => setTimeout(r, 600));

      setBenchmarkStatusMsg("Training Quantum SVR (Statevector) & Classical Baselines...");
      const updated = await api.runBenchmark(130, Math.floor(Math.random() * 1000) + 1);

      setBenchmarkStatusMsg("Evaluating Holdout Residuals & Storing Results...");
      await new Promise((r) => setTimeout(r, 400));

      setBenchmarkData(updated);
      setBenchmarkStatusMsg("");
    } catch (err: any) {
      console.error("Benchmark run failed:", err);
      alert("Failed to execute benchmark run: " + err.message);
    } finally {
      setRunningBenchmark(false);
      setBenchmarkStatusMsg("");
    }
  }

  // 3. Render and Update Interactive Apache ECharts
  useEffect(() => {
    if (!benchmarkData || loading) return;

    let isMounted = true;

    async function initCharts() {
      try {
        const echarts = await import("echarts");
        if (!isMounted) return;

        const models = benchmarkData?.models || [];
        const modelNames = models.map((m) => m.model);

        // Palette definition: distinctive, professional colors (no neon gradients)
        const getModelColor = (name: string) => {
          if (name.includes("Quantum")) return "#059669"; // Emerald 600
          if (name.includes("Forest")) return "#2563eb"; // Blue 600
          if (name.includes("SVR")) return "#d97706"; // Amber 600
          return "#64748b"; // Slate 500 (Ridge)
        };

        // -------------------------------------------------------------
        // A. Chart 1: R² Score Comparison
        // -------------------------------------------------------------
        if (r2ChartRef.current) {
          echartsInstances.current.r2?.dispose();
          const chart = echarts.init(r2ChartRef.current);
          echartsInstances.current.r2 = chart;

          chart.setOption({
            title: {
              text: "R² Coefficient of Determination",
              subtext: "Higher value indicates stronger explanatory fit on holdout test set",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              formatter: (params: any) => {
                const item = params[0];
                return `<div class="text-xs p-1">
                  <span class="font-bold text-slate-800">${item.name}</span><br/>
                  <span class="text-slate-500">R² Score: </span><span class="font-mono font-bold text-emerald-700">${item.value}</span>
                </div>`;
              },
            },
            grid: { top: 60, right: 20, bottom: 40, left: 45 },
            xAxis: {
              type: "category",
              data: modelNames,
              axisLabel: {
                interval: 0,
                fontSize: 11,
                color: "#334155",
                formatter: (val: string) => val.replace(" (QSVR)", "").replace(" (RBF)", ""),
              },
              axisTick: { alignWithLabel: true },
            },
            yAxis: {
              type: "value",
              name: "R² Score",
              min: 0,
              max: 1.0,
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            series: [
              {
                name: "R² Score",
                type: "bar",
                barWidth: "40%",
                data: models.map((m) => ({
                  value: m.r2,
                  itemStyle: { color: getModelColor(m.model), borderRadius: [4, 4, 0, 0] },
                })),
                label: {
                  show: true,
                  position: "top",
                  formatter: "{c}",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#0f172a",
                },
              },
            ],
          });
        }

        // -------------------------------------------------------------
        // B. Chart 2: Prediction Error Comparison (RMSE)
        // -------------------------------------------------------------
        if (rmseChartRef.current) {
          echartsInstances.current.rmse?.dispose();
          const chart = echarts.init(rmseChartRef.current);
          echartsInstances.current.rmse = chart;

          chart.setOption({
            title: {
              text: "Prediction Error (RMSE)",
              subtext: "Root Mean Squared Error in Q/acre (Lower is better)",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              formatter: (params: any) => {
                const item = params[0];
                return `<div class="text-xs p-1">
                  <span class="font-bold text-slate-800">${item.name}</span><br/>
                  <span class="text-slate-500">RMSE: </span><span class="font-mono font-bold text-slate-800">${item.value} Q/acre</span>
                </div>`;
              },
            },
            grid: { top: 60, right: 20, bottom: 40, left: 45 },
            xAxis: {
              type: "category",
              data: modelNames,
              axisLabel: {
                interval: 0,
                fontSize: 11,
                color: "#334155",
                formatter: (val: string) => val.replace(" (QSVR)", "").replace(" (RBF)", ""),
              },
            },
            yAxis: {
              type: "value",
              name: "RMSE (Q/ac)",
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            series: [
              {
                name: "RMSE",
                type: "bar",
                barWidth: "40%",
                data: models.map((m) => ({
                  value: m.rmse,
                  itemStyle: { color: getModelColor(m.model), borderRadius: [4, 4, 0, 0] },
                })),
                label: {
                  show: true,
                  position: "top",
                  formatter: "{c}",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#0f172a",
                },
              },
            ],
          });
        }

        // -------------------------------------------------------------
        // C. Chart 3: Mean Absolute Error (MAE)
        // -------------------------------------------------------------
        if (maeChartRef.current) {
          echartsInstances.current.mae?.dispose();
          const chart = echarts.init(maeChartRef.current);
          echartsInstances.current.mae = chart;

          chart.setOption({
            title: {
              text: "Mean Absolute Error (MAE)",
              subtext: "Average magnitude of absolute error in Q/acre (Lower is better)",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              formatter: (params: any) => {
                const item = params[0];
                return `<div class="text-xs p-1">
                  <span class="font-bold text-slate-800">${item.name}</span><br/>
                  <span class="text-slate-500">MAE: </span><span class="font-mono font-bold text-slate-800">${item.value} Q/acre</span>
                </div>`;
              },
            },
            grid: { top: 60, right: 20, bottom: 40, left: 45 },
            xAxis: {
              type: "category",
              data: modelNames,
              axisLabel: {
                interval: 0,
                fontSize: 11,
                color: "#334155",
                formatter: (val: string) => val.replace(" (QSVR)", "").replace(" (RBF)", ""),
              },
            },
            yAxis: {
              type: "value",
              name: "MAE (Q/ac)",
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            series: [
              {
                name: "MAE",
                type: "bar",
                barWidth: "40%",
                data: models.map((m) => ({
                  value: m.mae,
                  itemStyle: { color: getModelColor(m.model), borderRadius: [4, 4, 0, 0] },
                })),
                label: {
                  show: true,
                  position: "top",
                  formatter: "{c}",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#0f172a",
                },
              },
            ],
          });
        }

        // -------------------------------------------------------------
        // D. Chart 4: Actual vs Predicted Yield Scatter Plot (45° Identity Line)
        // -------------------------------------------------------------
        if (scatterChartRef.current) {
          echartsInstances.current.scatter?.dispose();
          const chart = echarts.init(scatterChartRef.current);
          echartsInstances.current.scatter = chart;

          const scatterDataPoints =
            benchmarkData?.actual_vs_predicted[scatterModel] ||
            benchmarkData?.actual_vs_predicted["Quantum SVR (QSVR)"] ||
            [];

          const minVal = Math.floor(
            Math.min(...scatterDataPoints.map((p) => Math.min(p.actual, p.predicted)), 20)
          );
          const maxVal = Math.ceil(
            Math.max(...scatterDataPoints.map((p) => Math.max(p.actual, p.predicted)), 50)
          );

          chart.setOption({
            title: {
              text: `Actual vs Predicted Yield: ${scatterModel}`,
              subtext: "Points clustered on the 45° reference line indicate perfect predictive concordance",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const pt = params.data;
                const err = (pt[1] - pt[0]).toFixed(2);
                return `<div class="text-xs p-1 space-y-1">
                  <span class="font-bold text-slate-800">${pt[2] || "Test Plot"}</span><br/>
                  <span class="text-slate-500">Actual Yield: </span><span class="font-mono font-bold text-slate-900">${pt[0]} Q/ac</span><br/>
                  <span class="text-slate-500">Predicted Yield: </span><span class="font-mono font-bold text-emerald-700">${pt[1]} Q/ac</span><br/>
                  <span class="text-slate-500">Error (Pred - Act): </span><span class="font-mono ${Number(err) > 0 ? "text-amber-600" : "text-blue-600"}">${err} Q/ac</span>
                </div>`;
              },
            },
            grid: { top: 60, right: 30, bottom: 45, left: 55 },
            xAxis: {
              type: "value",
              name: "Actual Yield (Q/acre)",
              nameLocation: "middle",
              nameGap: 28,
              min: minVal,
              max: maxVal,
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            yAxis: {
              type: "value",
              name: "Predicted Yield (Q/acre)",
              min: minVal,
              max: maxVal,
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            series: [
              // 45 degree reference line (Ideal Prediction: y = x)
              {
                name: "Ideal (y = x)",
                type: "line",
                data: [
                  [minVal, minVal],
                  [maxVal, maxVal],
                ],
                symbol: "none",
                lineStyle: { color: "#94a3b8", width: 2, type: "dashed" },
                tooltip: { show: false },
              },
              // Scatter Points
              {
                name: scatterModel,
                type: "scatter",
                symbolSize: 9,
                data: scatterDataPoints.map((p) => [p.actual, p.predicted, p.sample_id]),
                itemStyle: {
                  color: getModelColor(scatterModel),
                  borderColor: "#ffffff",
                  borderWidth: 1.5,
                  shadowColor: "rgba(0, 0, 0, 0.1)",
                  shadowBlur: 3,
                },
              },
            ],
          });
        }

        // -------------------------------------------------------------
        // E. Chart 5: Prediction Residuals Plot (Zero Reference Line)
        // -------------------------------------------------------------
        if (residualChartRef.current) {
          echartsInstances.current.residual?.dispose();
          const chart = echarts.init(residualChartRef.current);
          echartsInstances.current.residual = chart;

          const residualDataPoints =
            benchmarkData?.residuals[residualModel] ||
            benchmarkData?.residuals["Quantum SVR (QSVR)"] ||
            [];

          const minPred = Math.floor(Math.min(...residualDataPoints.map((p) => p.predicted), 20));
          const maxPred = Math.ceil(Math.max(...residualDataPoints.map((p) => p.predicted), 50));

          chart.setOption({
            title: {
              text: `Residual Distribution: ${residualModel}`,
              subtext: "Residual (Actual − Predicted) vs. Predicted Yield (Zero horizontal line denotes unbiased predictions)",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const pt = params.data;
                return `<div class="text-xs p-1 space-y-1">
                  <span class="font-bold text-slate-800">${pt[2] || "Test Plot"}</span><br/>
                  <span class="text-slate-500">Predicted Yield: </span><span class="font-mono font-bold text-slate-900">${pt[0]} Q/ac</span><br/>
                  <span class="text-slate-500">Residual (Act - Pred): </span><span class="font-mono font-bold ${Number(pt[1]) >= 0 ? "text-emerald-600" : "text-rose-600"}">${pt[1]} Q/ac</span>
                </div>`;
              },
            },
            grid: { top: 60, right: 30, bottom: 45, left: 55 },
            xAxis: {
              type: "value",
              name: "Predicted Yield (Q/acre)",
              nameLocation: "middle",
              nameGap: 28,
              min: minPred,
              max: maxPred,
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            yAxis: {
              type: "value",
              name: "Residual (Q/acre)",
              splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
            series: [
              // Zero reference line (y = 0)
              {
                name: "Zero Error",
                type: "line",
                data: [
                  [minPred, 0],
                  [maxPred, 0],
                ],
                symbol: "none",
                lineStyle: { color: "#cbd5e1", width: 2, type: "solid" },
                tooltip: { show: false },
              },
              // Residual points
              {
                name: "Residual",
                type: "scatter",
                symbolSize: 8,
                data: residualDataPoints.map((p) => [p.predicted, p.residual, p.sample_id]),
                itemStyle: {
                  color: (params: any) => {
                    const res = params.data[1];
                    return res >= 0 ? "#059669" : "#e11d48";
                  },
                  borderColor: "#ffffff",
                  borderWidth: 1,
                },
              },
            ],
          });
        }

        // -------------------------------------------------------------
        // F. Chart 6: Training vs Inference Execution Latency
        // -------------------------------------------------------------
        if (timingChartRef.current) {
          echartsInstances.current.timing?.dispose();
          const chart = echarts.init(timingChartRef.current);
          echartsInstances.current.timing = chart;

          chart.setOption({
            title: {
              text: "Training & Inference Execution Time",
              subtext: "Measured execution latency across models on holdout evaluation hardware",
              left: "left",
              textStyle: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
              subtextStyle: { fontSize: 11, color: "#64748b" },
            },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
            },
            legend: {
              data: ["Train Time (s)", "Inference Time (ms)"],
              top: 25,
              right: 20,
              textStyle: { fontSize: 11, color: "#475569" },
            },
            grid: { top: 65, right: 55, bottom: 40, left: 55 },
            xAxis: {
              type: "category",
              data: modelNames,
              axisLabel: {
                interval: 0,
                fontSize: 11,
                color: "#334155",
                formatter: (val: string) => val.replace(" (QSVR)", "").replace(" (RBF)", ""),
              },
            },
            yAxis: [
              {
                type: "value",
                name: "Train Time (s)",
                position: "left",
                splitLine: { lineStyle: { stroke: "#e2e8f0", type: "dashed" } },
                axisLabel: { color: "#64748b", fontSize: 11 },
              },
              {
                type: "value",
                name: "Inference (ms)",
                position: "right",
                splitLine: { show: false },
                axisLabel: { color: "#64748b", fontSize: 11 },
              },
            ],
            series: [
              {
                name: "Train Time (s)",
                type: "bar",
                data: models.map((m) => m.train_time_sec),
                itemStyle: { color: "#3b82f6", borderRadius: [3, 3, 0, 0] },
                barWidth: "30%",
              },
              {
                name: "Inference Time (ms)",
                type: "bar",
                yAxisIndex: 1,
                data: models.map((m) => Number((m.inf_time_sec * 1000).toFixed(1))),
                itemStyle: { color: "#10b981", borderRadius: [3, 3, 0, 0] },
                barWidth: "30%",
              },
            ],
          });
        }
      } catch (e) {
        console.error("ECharts init error in benchmarks page:", e);
      }
    }

    initCharts();

    const handleResize = () => {
      Object.values(echartsInstances.current).forEach((chart) => chart?.resize());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      Object.values(echartsInstances.current).forEach((chart) => chart?.dispose());
    };
  }, [benchmarkData, loading, scatterModel, residualModel]);

  if (loading && !benchmarkData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800">Loading Agronomic Benchmark Suite...</p>
          <p className="text-xs text-slate-500">
            Retrieving verified model evaluation results, error distributions, and quantum circuit specifications.
          </p>
        </div>
      </div>
    );
  }

  if (error || !benchmarkData) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Failed to load Model Comparison data</span>
        </div>
        <p className="text-xs text-rose-700">{error || "No benchmark evaluation data returned from the backend."}</p>
        <button
          onClick={() => loadBenchmarkData(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
        >
          Retry Benchmark Connection
        </button>
      </div>
    );
  }

  const { headline_comparison, models, dataset, evaluation_environment, quantum_details } = benchmarkData;
  const qModel = headline_comparison.quantum_model;
  const cModel = headline_comparison.best_classical_model;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. Header & Benchmark Controls */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Model Performance Comparison
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Audited ML Benchmark ({dataset.version})
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Objective evaluation comparing Classical Machine Learning vs. Quantum Machine Learning on identical holdout splits ({dataset.sample_count} plot samples, zero data leakage).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => loadBenchmarkData(true)}
            disabled={runningBenchmark}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors"
            title="Refresh stored benchmark results"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
              runningBenchmark
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-700 hover:bg-emerald-800 active:scale-95"
            }`}
          >
            {runningBenchmark ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Benchmark...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Running Benchmark Status Bar */}
      {runningBenchmark && benchmarkStatusMsg && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700 flex-shrink-0" />
          <span className="font-medium">{benchmarkStatusMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. What Is Being Compared? (Context & Architecture Scope) */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 text-xs text-slate-600 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>What is Being Compared?</span>
        </div>
        <p className="leading-relaxed">
          This platform benchmarks <strong>Classical Machine Learning</strong> (Random Forest Regressor, Classical RBF Support Vector Regression, and L2 Ridge Regression) directly against <strong>Quantum Machine Learning</strong> (Quantum Support Vector Regression executing over a 4-Qubit <code className="text-emerald-800 font-mono">ZZFeatureMap</code> parameterized Hilbert state space on Qiskit Aer).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Random Forest</span>
            <span className="text-slate-500">100 Trees (Scikit-Learn)</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">RBF SVR</span>
            <span className="text-slate-500">Classical Radial Basis</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Ridge Regression</span>
            <span className="text-slate-500">L2 Regularized Baseline</span>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
            <span className="font-semibold text-emerald-900">Quantum SVR</span>
            <span className="text-emerald-700 font-medium">4-Qubit ZZFeatureMap</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Headline Comparison & Signature Scientific Summary */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Headline Comparison: Quantum vs. Top Classical Model
            </h2>
            <p className="text-xs text-slate-500">
              Direct comparison between Quantum SVR and the highest-ranked classical algorithm on the holdout test set.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Benchmark ID: {benchmarkData.benchmark_id}
          </div>
        </div>

        {/* Side-by-Side Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quantum Model Card */}
          <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-emerald-700" />
                <span>Quantum Model</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                QSVR (4 Qubits)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">R² Score</span>
                <span className="text-sm font-mono font-bold text-emerald-800">{qModel.r2.toFixed(4)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">RMSE</span>
                <span className="text-sm font-mono font-bold text-slate-800">{qModel.rmse.toFixed(3)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">MAE</span>
                <span className="text-sm font-mono font-bold text-slate-800">{qModel.mae.toFixed(3)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Inference Latency:</span>
              <span className="font-mono text-slate-700">{(qModel.inf_time_sec * 1000).toFixed(1)} ms</span>
            </div>
          </div>

          {/* Best Classical Model Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Best Classical Model</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                {cModel.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">R² Score</span>
                <span className="text-sm font-mono font-bold text-slate-900">{cModel.r2.toFixed(4)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">RMSE</span>
                <span className="text-sm font-mono font-bold text-slate-800">{cModel.rmse.toFixed(3)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">MAE</span>
                <span className="text-sm font-mono font-bold text-slate-800">{cModel.mae.toFixed(3)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Inference Latency:</span>
              <span className="font-mono text-slate-700">{(cModel.inf_time_sec * 1000).toFixed(1)} ms</span>
            </div>
          </div>

          {/* Delta Difference Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900">Calculated Deltas</span>
              <span className="text-[10px] text-slate-500 font-medium">Quantum − Classical</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Δ R²</span>
                <span
                  className={`text-sm font-mono font-bold flex items-center justify-center gap-0.5 ${
                    headline_comparison.r2_delta >= 0 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {headline_comparison.r2_delta >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {headline_comparison.r2_delta.toFixed(4)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Δ RMSE</span>
                <span
                  className={`text-sm font-mono font-bold flex items-center justify-center gap-0.5 ${
                    headline_comparison.rmse_delta <= 0 ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {headline_comparison.rmse_delta > 0 ? "+" : ""}
                  {headline_comparison.rmse_delta.toFixed(3)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Δ MAE</span>
                <span
                  className={`text-sm font-mono font-bold flex items-center justify-center gap-0.5 ${
                    headline_comparison.mae_delta <= 0 ? "text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {headline_comparison.mae_delta > 0 ? "+" : ""}
                  {headline_comparison.mae_delta.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Benchmark Winner:</span>
              <span className="font-semibold text-slate-900">{headline_comparison.winner}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Signature Comparison Statement */}
        <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Evaluation Statement: </span>
            <span>{headline_comparison.summary_statement}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Comprehensive Metrics & Ranking Table */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Comprehensive Model Ranking Table</h3>
            <p className="text-xs text-slate-500">
              Full evaluation metrics sorted strictly by R² Coefficient on holdout test set ({dataset.test_count} plot samples).
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono self-start sm:self-auto">
            Higher R² = Better | Lower RMSE/MAE = Better
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Paradigm</th>
                <th className="py-3 px-4">Framework</th>
                <th className="py-3 px-4 font-mono">R² Score</th>
                <th className="py-3 px-4 font-mono">RMSE (Q/ac)</th>
                <th className="py-3 px-4 font-mono">MAE (Q/ac)</th>
                <th className="py-3 px-4 font-mono">MAPE (%)</th>
                <th className="py-3 px-4 font-mono">Train (s)</th>
                <th className="py-3 px-4 font-mono">Inference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => {
                const isQuantum = m.model.includes("Quantum");
                return (
                  <tr key={m.model_id} className={`hover:bg-slate-50/70 transition-colors ${isQuantum ? "bg-emerald-50/20" : ""}`}>
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-700">
                      #{m.rank}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                      {isQuantum ? (
                        <Atom className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      ) : (
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <span>{m.model}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isQuantum
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{m.framework}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {m.r2.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{m.rmse.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{m.mae.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{m.mape.toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{m.train_time_sec.toFixed(3)}s</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {(m.inf_time_sec * 1000).toFixed(1)} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. Interactive Apache ECharts Suite (R², RMSE, MAE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* R² Chart */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div ref={r2ChartRef} className="w-full h-64" />
        </div>

        {/* RMSE Chart */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div ref={rmseChartRef} className="w-full h-64" />
        </div>

        {/* MAE Chart */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div ref={maeChartRef} className="w-full h-64" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. Diagnostic Scatter Plots: Actual vs Predicted & Residuals */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Actual vs Predicted Scatter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Model Selector:</span>
            <div className="relative">
              <select
                value={scatterModel}
                onChange={(e) => setScatterModel(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.model_id} value={m.model}>
                    {m.model}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
          <div ref={scatterChartRef} className="w-full h-72" />
        </div>

        {/* Prediction Residuals Plot */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Residual Model:</span>
            <div className="relative">
              <select
                value={residualModel}
                onChange={(e) => setResidualModel(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.model_id} value={m.model}>
                    {m.model}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
          <div ref={residualChartRef} className="w-full h-72" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. Training Latency & Evaluation Hardware Environment */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latency Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div ref={timingChartRef} className="w-full h-64" />
        </div>

        {/* Evaluation Hardware / Host Spec */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>Evaluation Environment</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Host Processor</span>
              <span className="font-mono text-slate-800 truncate max-w-[150px]">{evaluation_environment.cpu}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">CPU Cores</span>
              <span className="font-mono text-slate-800">{evaluation_environment.cores} Logical Cores</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">System Memory</span>
              <span className="font-mono text-slate-800">{evaluation_environment.memory_gb} GB RAM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Python Runtime</span>
              <span className="font-mono text-slate-800">v{evaluation_environment.python_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Qiskit Core</span>
              <span className="font-mono text-slate-800">v{evaluation_environment.qiskit_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Aer Simulator</span>
              <span className="font-mono text-slate-800">{evaluation_environment.qiskit_aer_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Operating System</span>
              <span className="font-mono text-slate-800">{evaluation_environment.os}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. Evaluation Setup & Data Leakage Prevention Panel */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dataset Setup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Evaluation Setup & Dataset</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">Dataset Name:</span>
              <span className="font-semibold text-slate-800">{dataset.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dataset Version:</span>
              <span className="font-mono font-semibold text-slate-800">{dataset.version}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Sample Count:</span>
              <span className="font-mono font-semibold text-slate-800">{dataset.sample_count} plots</span>
            </div>
            <div>
              <span className="text-slate-500 block">Train / Test Split:</span>
              <span className="font-mono font-semibold text-slate-800">
                {(dataset.train_split * 100).toFixed(0)}% / {(dataset.test_split * 100).toFixed(0)}% ({dataset.train_count} train / {dataset.test_count} test)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Target Variable:</span>
              <span className="font-semibold text-slate-800">{dataset.target}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Random Seed:</span>
              <span className="font-mono font-semibold text-slate-800">{dataset.random_seed}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-500 block text-[11px] mb-1">Features Evaluated:</span>
            <div className="flex flex-wrap gap-1.5">
              {dataset.features.map((feat) => (
                <span key={feat} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Data Leakage Prevention Methodology */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Evaluation Method & Data Leakage Prevention</span>
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px]">
            To ensure complete scientific integrity, all preprocessing transforms (including MinMaxScaler for Quantum ZZFeatureMaps and StandardScaler for Classical SVR and Ridge) are <strong>fitted strictly on training split partitions</strong>.
          </p>

          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>No test set samples influence training feature scaling or kernel matrix calculations.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Identical target holdout split is evaluated across all classical and quantum models simultaneously.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Dual optimization coefficients α are calculated purely from training Gram matrices.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. Quantum Model Technical Specifications (Visually Secondary) */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Atom className="w-4 h-4 text-emerald-700" />
          <span>Quantum Model Technical Specifications</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-[11px]">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Qubits</span>
            <span className="font-mono font-bold text-slate-900">{quantum_details.num_qubits} Qubits</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Ansatz</span>
            <span className="font-mono font-bold text-slate-900">ZZFeatureMap</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Repetitions</span>
            <span className="font-mono font-bold text-slate-900">{quantum_details.reps} Reps</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Circuit Depth</span>
            <span className="font-mono font-bold text-slate-900">{quantum_details.circuit_depth}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Total Gates</span>
            <span className="font-mono font-bold text-slate-900">{quantum_details.total_gates}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Backend</span>
            <span className="font-mono font-bold text-slate-900">Qiskit Aer</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic">
          {quantum_details.disclosed_limitations}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 10. User-Friendly Educational Guide ("What does this mean?") */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>What does this mean for Agricultural Decision Making?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 text-[11px] leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">R² Score (Coefficient of Determination)</span>
            <p>
              Shows how well environmental variance (nitrogen, moisture, rainfall, NDVI) explains final crop yield. A value closer to 1.0 indicates a model that reliably captures real-world yield fluctuations.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">RMSE (Root Mean Squared Error)</span>
            <p>
              Measures typical error magnitude in Quintals/Acre, giving higher penalty to large outliers. Lower values denote higher precision in yield forecasting.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">MAE (Mean Absolute Error)</span>
            <p>
              Calculates the average absolute difference between predicted and actual harvest yield across all test plots, providing an intuitive measure of expected error per acre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
