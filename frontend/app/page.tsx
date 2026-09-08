import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Leaf,
  CloudSun,
  ShieldCheck,
  Atom,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  DollarSign,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <header className="h-20 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              Q
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-xl">
                Agri<span className="text-emerald-700">Quantum</span>
              </span>
              <span className="text-[11px] text-slate-400 block font-medium -mt-1">
                Precision Agricultural Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">
              How It Works
            </a>
            <a href="#yield-prediction" className="hover:text-emerald-800 transition-colors">
              Yield Prediction
            </a>
            <a href="#recommendations" className="hover:text-emerald-800 transition-colors">
              Precision Recommendations
            </a>
            <a href="#satellite-health" className="hover:text-emerald-800 transition-colors">
              Satellite Health
            </a>
            <a href="#economic-impact" className="hover:text-emerald-800 transition-colors">
              Economic Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Commercial Agronomic Decision Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.08]">
            Make Better Farming Decisions With Better Data
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            AgriQuantum combines soil information, weather conditions, satellite intelligence, and advanced machine learning to help farmers understand crop performance, predict yield, and make better input decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#problem"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>Explore AgriQuantum</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Hero Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 text-left">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Crop Health</span>
              <div className="text-xl font-bold text-slate-900">0.82 NDVI</div>
              <p className="text-xs text-slate-500">Copernicus Sentinel-2 10m L2A</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Average Yield</span>
              <div className="text-xl font-bold text-emerald-800">41.8 Q / Acre</div>
              <p className="text-xs text-slate-500">+8.4% above regional average</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Weather Tracking</span>
              <div className="text-xl font-bold text-slate-900">7-Day Forecast</div>
              <p className="text-xs text-slate-500">Visual Crossing Hyperlocal</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Quantum ML</span>
              <div className="text-xl font-bold text-slate-900">4 Qubits</div>
              <p className="text-xs text-slate-500">Hilbert space kernel projection</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section id="problem" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">The Agricultural Challenge</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Farming With Incomplete Information Costs Millions
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every season, farmers face complex physiological interactions across soil chemistry, shifting weather patterns, and satellite signals. Traditional blanket advice leads to costly mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="font-bold text-slate-900 text-base">Excessive Fertilizer Costs</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Applying uniform nitrogen dosages across variable plots causes up to 30% fertilizer waste, soil acidification, and unnecessary operating expenditure.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                ~
              </div>
              <h3 className="font-bold text-slate-900 text-base">Unpredictable Harvest Yields</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Conventional yield estimations rely on static regional formulas that fail to model non-linear interactions between soil moisture, temperature spikes, and canopy vigor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                💧
              </div>
              <h3 className="font-bold text-slate-900 text-base">Irrigation Inefficiency</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Misjudging root-zone volumetric moisture and upcoming rainfall budgets results in crop water stress or wasteful pumping costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW AGRIQUANTUM WORKS */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              How AgriQuantum Works
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              A systematic four-stage pipeline transforming multi-spectral telemetry into clear, profitable agronomic actions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-700">01</span>
              <h3 className="font-bold text-slate-900 text-base">Telemetry Ingestion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collects soil nutrients (N-P-K), moisture, hyperlocal Visual Crossing weather, and Copernicus Sentinel-2 satellite imagery.
              </p>
            </div>

            <div className="relative bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-700">02</span>
              <h3 className="font-bold text-slate-900 text-base">Quantum Kernel Mapping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transforms normalized features into a 16-dimensional quantum Hilbert space using Qiskit Aer to uncover non-linear crop correlations.
              </p>
            </div>

            <div className="relative bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-700">03</span>
              <h3 className="font-bold text-slate-900 text-base">Yield Prediction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generates robust harvest forecasts with statistical confidence scores and regional benchmark comparisons.
              </p>
            </div>

            <div className="relative bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-700">04</span>
              <h3 className="font-bold text-slate-900 text-base">Actionable Advice</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Delivers precise split-dose fertilizer amounts, irrigation schedules, and clear economic return estimates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AGRICULTURAL INTELLIGENCE */}
      <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Operational Overview</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Total Visibility Over Every Acre and Season
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Consolidate your entire agricultural operation in a single workspace. Monitor multiple farm locations, track vegetative vigor across individual plots, and review historical harvest records.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Cadastral farm and field boundary mapping with area calculations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Multi-crop lifecycle monitoring for wheat, rice, maize, and legumes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Continuous cloud synchronization powered by PostgreSQL and Supabase</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/dashboard/farms"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>View Farm Analysis Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Green Valley Agricultural Station</div>
                <div className="text-[11px] text-slate-400">Krishna River Basin • 120 Hectares</div>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Active Season
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Crop</span>
                <div className="font-bold text-slate-800 mt-0.5">Winter Wheat</div>
                <div className="text-[10px] text-slate-500">Stem Elongation (Feekes 6)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Soil Profile</span>
                <div className="font-bold text-slate-800 mt-0.5">Alluvial Loam</div>
                <div className="text-[10px] text-slate-500">pH 6.8 • Balanced NPK</div>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-medium">Seasonal Crop Vigor Index</span>
              <span className="font-bold text-emerald-800">Optimal (0.82 NDVI)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. YIELD PREDICTION */}
      <section id="yield-prediction" className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-900">Quantum Yield Inference Output</div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Model v2.5
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-1">
                <span className="text-[11px] text-emerald-800 font-medium">Predicted Harvest</span>
                <div className="text-2xl font-extrabold text-emerald-900">41.8 Q/ac</div>
                <span className="text-[10px] text-emerald-700">5.23 Tonnes / Hectare</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Model Confidence</span>
                <div className="text-2xl font-extrabold text-slate-900">96.8%</div>
                <span className="text-[10px] text-slate-500">±1.4 Q/ac statistical range</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              Calculated using 4-qubit Quantum Support Vector Regression on normalized nitrogen (85 kg/ha), root moisture (28.5%), and 450mm cumulative rainfall.
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Crop Yield Prediction</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Forecast Harvest Volume Weeks in Advance
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Anticipate production bottlenecks and secure forward contracts with high-confidence crop yield predictions calibrated across soil types and regional microclimates.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Yield outputs in both Quintals per Acre and Tonnes per Hectare</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Explicit uncertainty bounds preventing overconfident planning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Full audit trail archived directly to your relational database</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/dashboard/predict"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>Run Yield Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRECISION RECOMMENDATIONS */}
      <section id="recommendations" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Input Optimization</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Actionable Fertilizer and Irrigation Adjustments
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Stop guessing application rates. AgriQuantum calculates exactly how much nitrogen and supplemental water are required to reach optimal crop production without overspending.
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Nitrogen Optimization Advisory</div>
                <p className="text-xs text-slate-500">
                  Calculates targeted split doses (e.g. +25 kg N/ha before heading) to maximize chlorophyll synthesis while avoiding nutrient leaching.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Supplemental Irrigation Scheduling</div>
                <p className="text-xs text-slate-500">
                  Accounts for real-time soil moisture and upcoming 7-day precipitation forecasts to prevent over-irrigation.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/recommendations"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>Generate Farm Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-100">
              Recommendation Summary
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-semibold uppercase">Nitrogen Adjustment</span>
                <div className="text-lg font-bold text-emerald-900 mt-0.5">+20 kg/ha</div>
                <span className="text-[10px] text-emerald-700">Split dose application</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-800 font-semibold uppercase">Irrigation Demand</span>
                <div className="text-lg font-bold text-blue-900 mt-0.5">18 mm / week</div>
                <span className="text-[10px] text-blue-700">Micro-irrigation cycle</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Projected Yield Gain</span>
              <div className="text-xl font-bold text-slate-900">+4.6 Q / Acre (+11.2%)</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Net margin increase: ₹4,850 / acre</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SATELLITE CROP HEALTH */}
      <section id="satellite-health" className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Copernicus Sentinel-2 Telemetry</span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                10m Resolution
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Vegetation Vigor (NDVI)</span>
                <span className="font-bold text-emerald-800 font-mono">0.82 / 1.00</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "82%" }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0.0 (Barren)</span>
                <span>0.5 (Moderate)</span>
                <span>1.0 (Dense Canopy)</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Band 8 (NIR)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">0.482</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Band 4 (Red)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">0.048</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400">Revisit Cycle</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">5 Days</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Satellite Crop Health</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Multispectral Earth Observation From Orbit
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Detect vegetation stress, chlorophyll deficiencies, and uneven growth across your fields before they become visible from the ground using ESA Copernicus Sentinel-2 satellite data.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>10-meter surface resolution updated every 5 days</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Atmospherically corrected Level-2A surface reflectance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Automated cloud masking and canopy index computation</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/dashboard/crop-health"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>View Satellite Crop Health</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUANTUM MODEL ANALYSIS */}
      <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Scientific Credibility</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Quantum Kernel Feature Mapping
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Why quantum machine learning for agriculture? Crop growth involves complex non-linear couplings between nutrients, soil hydrology, and atmospheric demand that classical linear models oversimplify.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Atom className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">4-Qubit Circuit Architecture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Encodes soil nitrogen, moisture, rainfall, and NDVI into quantum state vectors using Pauli-Z and ZZ entangling rotation gates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Empirical Benchmark Validation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Benchmarked side-by-side against Random Forest, Classical RBF-SVR, and Ridge Regression on identical train/test splits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Certified Audit Reports</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Export verifiable PDF reports with cryptographic SHA-256 validation digests for agricultural auditors and financial lenders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ECONOMIC IMPACT */}
      <section id="economic-impact" className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Measurable Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Proven Return on Agricultural Inputs
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Precision farming pays for itself by reducing unnecessary input costs while capturing high-value harvest upside.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <div className="text-3xl font-extrabold text-emerald-800">18.5%</div>
              <h3 className="font-bold text-slate-900 text-sm">Average Fertilizer Savings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Eliminating uniform nitrogen application over-dosing across non-responsive zones.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <div className="text-3xl font-extrabold text-emerald-800">+8.4%</div>
              <h3 className="font-bold text-slate-900 text-sm">Harvest Yield Expansion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Targeting supplemental micro-nutrients and irrigation at critical vegetative growth stages.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <div className="text-3xl font-extrabold text-emerald-800">₹4,850</div>
              <h3 className="font-bold text-slate-900 text-sm">Net Margin Gain / Acre</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct economic surplus calculated from input savings plus incremental harvest revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="py-20 sm:py-24 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
            <span>Ready for Operational Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Start Making Better Farming Decisions Today
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect your farm holdings, monitor satellite vegetative health, and run quantum-assisted yield predictions with AgriQuantum.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              <span>Explore Architecture</span>
            </a>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AgriQuantum</span>
            <span>• Precision Agricultural Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span>FastAPI Gateway</span>
            <span>Supabase Cloud</span>
            <span>Visual Crossing</span>
            <span>Copernicus Sentinel-2</span>
            <span>Qiskit Aer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
