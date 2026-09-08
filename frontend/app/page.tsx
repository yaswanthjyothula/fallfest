import React from "react";
import Link from "next/link";
import {
  Atom,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Leaf,
  CloudSun,
  Database,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Atom className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-xl">
                Agri<span className="text-emerald-700">Quantum</span>
              </span>
              <span className="text-xs text-slate-400 block font-medium -mt-1">
                Precision Agronomy & QML Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Control Center
            </Link>
            <Link
              href="/dashboard/predict"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-semibold text-emerald-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quantum Computing for Global Food Security</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Quantum Intelligence for <br />
            <span className="text-emerald-700">Precision Agronomy</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Harnessing 4-qubit Hilbert kernel projection, Copernicus Sentinel-2 multispectral vegetation intelligence, and Visual Crossing hyperlocal meteorology to maximize crop yield and optimize input economics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <span>Enter Operational Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/predict"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm px-6 py-3 rounded-xl transition-all"
            >
              <Atom className="w-4 h-4 text-emerald-700" />
              <span>Simulate Quantum Circuit</span>
            </Link>
          </div>

          {/* Core Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12 text-left">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Algorithm</span>
              <div className="font-bold text-slate-900 text-sm">4-Qubit QSVR</div>
              <p className="text-[11px] text-slate-500">ZZFeatureMap with linear entanglement</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Satellite</span>
              <div className="font-bold text-slate-900 text-sm">Sentinel-2 L2A</div>
              <p className="text-[11px] text-slate-500">10m B08 NIR & B04 Red NDVI canopy index</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Weather Engine</span>
              <div className="font-bold text-slate-900 text-sm">Visual Crossing</div>
              <p className="text-[11px] text-slate-500">Hyperlocal thermal & precipitation budget</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Compliance</span>
              <div className="font-bold text-slate-900 text-sm">ReportLab Certified</div>
              <p className="text-[11px] text-slate-500">SHA-256 cryptographic verification digest</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              End-to-End Precision Agricultural Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Engineered for farmers, agricultural organizations, research institutes, and agribusiness auditors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Quantum Support Vector Regression</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Project non-linear multi-variable physiological interactions (nitrogen, moisture, rainfall, temperature) into Hilbert space for yield prediction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Precision Resource Optimization</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Closed-loop advisory calculating optimal split-dose nitrogen fertilizer and supplemental irrigation timing with INR cost and yield projections.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Certified Compliance Auditing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate official agronomic audit certificates sealed with SHA-256 validation digests for crop insurance verification and institutional compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">AgriQuantum Platform</span>
            <span>•</span>
            <span>Production Version 2.5.0</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Qiskit Aer, Copernicus Sentinel-2, Visual Crossing Weather & Supabase
          </div>
        </div>
      </footer>
    </div>
  );
}
