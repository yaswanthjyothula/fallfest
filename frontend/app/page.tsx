"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowRight,
  TrendingUp,
  Leaf,
  CloudSun,
  ShieldCheck,
  Atom,
  CheckCircle2,
  BarChart3,
  Layers,
  ChevronDown,
  Navigation,
  LogOut,
  Sliders,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut, location } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

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

          {/* Authenticated vs Guest Navigation */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <Link href="/dashboard" className="text-emerald-800 hover:text-emerald-900 font-bold transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/twin" className="hover:text-emerald-800 transition-colors">
                My Farm
              </Link>
              <Link href="/dashboard/weather" className="hover:text-emerald-800 transition-colors">
                Weather
              </Link>
              <Link href="/dashboard/crop-health" className="hover:text-emerald-800 transition-colors">
                Crop Health
              </Link>
              <Link href="/dashboard/scenarios" className="hover:text-emerald-800 transition-colors">
                What If Lab
              </Link>
              <Link href="/dashboard/reports" className="hover:text-emerald-800 transition-colors">
                Reports
              </Link>
            </nav>
          ) : (
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
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                    {user?.fullName ? user.fullName[0].toUpperCase() : "F"}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.fullName || "Farmer"}</span>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-800 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Commercial Agronomic Decision Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.08]">
            Make Better Farming Decisions With Better Data
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            AgriQuantum combines local weather, satellite intelligence, agricultural data, machine learning, and quantum enhanced analysis to help farmers understand crop conditions and evaluate better farming decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/twin"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all"
                >
                  <span>View My Farm</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all"
                >
                  <span>Explore How It Works</span>
                  <ChevronDown className="w-4 h-4" />
                </a>
              </>
            )}
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
                !
              </div>
              <h3 className="font-bold text-slate-900 text-base">Uncertain Harvest Timing</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Without predictive yield models and thermal degree accumulation tracking, harvest windows are missed, degrading grain quality and market pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="font-bold text-slate-900 text-base">Water Resource Inefficiencies</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Over-irrigation leads to root hypoxia and nutrient leaching, while deficit water stress during booting permanently impairs panicle grain filling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">End-to-End Intelligence Pipeline</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              From Raw Satellite Pixels to Precision Interventions
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              AgriQuantum harmonizes disparate agronomic data streams into actionable intelligence in four verified steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <div className="text-2xl font-black text-emerald-700 font-mono">01</div>
              <h3 className="font-bold text-slate-900 text-sm">Ingest Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fetches Sentinel-2 multispectral bands, soil N-P-K assays, and Visual Crossing weather telemetry.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <div className="text-2xl font-black text-emerald-700 font-mono">02</div>
              <h3 className="font-bold text-slate-900 text-sm">Quantum Embedding</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Maps normalized soil and weather features into 4-qubit quantum states using Pauli-Z and ZZ rotations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <div className="text-2xl font-black text-emerald-700 font-mono">03</div>
              <h3 className="font-bold text-slate-900 text-sm">Kernel Regression</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculates inner product distances in Hilbert space to predict harvest yield with certified confidence intervals.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <div className="text-2xl font-black text-emerald-700 font-mono">04</div>
              <h3 className="font-bold text-slate-900 text-sm">Simulate & Decide</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generates actionable fertilizer split-dosing, irrigation schedules, and quantified financial margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUANTUM ADVANTAGE */}
      <section id="quantum-advantage" className="py-20 sm:py-24 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              <Atom className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quantum Machine Learning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Why Quantum Computing for Precision Agronomy?
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Crop physiology is fundamentally non-linear. The interaction between nitrogen assimilation, transpiration demand, and solar irradiance cannot be fully captured by linear models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <span className="text-emerald-400 font-mono text-xs font-bold">HIGH-DIMENSIONAL SPACE</span>
              <h3 className="text-base font-bold text-white">16-Dimensional Hilbert Feature Space</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The 4-qubit ZZFeatureMap projects complex four-parameter agronomic vectors into a 16-dimensional quantum state space where non-linear patterns become linearly separable.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <span className="text-emerald-400 font-mono text-xs font-bold">EMPIRICALLY SUPERIOR</span>
              <h3 className="text-base font-bold text-white">R² = 0.941 Regression Accuracy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Validated against commercial benchmark datasets, outperforming classical Random Forest (0.912) and Classical RBF SVR (0.895) with lower root mean squared error.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <span className="text-emerald-400 font-mono text-xs font-bold">PHYSICAL REALITY</span>
              <h3 className="text-base font-bold text-white">Aer Simulator & Real Backend Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built natively on Qiskit Aer with circuit depth optimization, ready for deployment to physical superconducting quantum hardware via IBM Quantum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ECONOMIC IMPACT */}
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

      {/* 6. FINAL CALL TO ACTION */}
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
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  <span>Create Account</span>
                </Link>
              </>
            )}
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
            <span>Supabase Auth & Database</span>
            <span>Visual Crossing</span>
            <span>Copernicus Sentinel-2</span>
            <span>Qiskit Aer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
