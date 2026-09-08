"use client";

import React from "react";
import { HelpCircle, BookOpen, Atom, CloudSun, Leaf, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HelpAndSupportPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>Documentation & Reference</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          AgriQuantum Platform Documentation
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Operational guides, agronomic input tolerances, quantum machine learning explanations, and technical support resources.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Guide 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Atom className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">How Quantum Yield Prediction Works</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            AgriQuantum projects 4 primary agronomic parameters (soil nitrogen, moisture, rainfall, NDVI) into a 16-dimensional quantum Hilbert space using a 2-repetition ZZFeatureMap to capture complex physiological interactions that classical linear models miss.
          </p>
          <Link
            href="/dashboard/quantum"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-1"
          >
            <span>Explore Quantum Circuit</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Guide 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Leaf className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Interpreting Satellite NDVI</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            NDVI (Normalized Difference Vegetation Index) ranges from 0.0 to 1.0. Values above 0.70 indicate healthy chlorophyll canopy density. Values between 0.40 and 0.60 indicate moderate canopy cover, while values below 0.35 signal potential moisture or nutrient stress.
          </p>
          <Link
            href="/dashboard/crop-health"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 pt-1"
          >
            <span>Inspect Crop Health</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Guide 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CloudSun className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Weather Telemetry & Quotas</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Weather conditions and 7-day outlooks are fetched via Visual Crossing API with client-side 5-minute caching to optimize network round-trips and preserve API allowances. Historical seasonal data informs crop evapotranspiration calculations.
          </p>
          <Link
            href="/dashboard/weather"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 pt-1"
          >
            <span>View Weather Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recommended Agronomic Input Ranges */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Recommended Agronomic Input Ranges</h3>
          <p className="text-xs text-slate-500">Physical bounds enforced by the simulation engine during inference</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Parameter</th>
                <th className="py-2.5 px-4">Unit</th>
                <th className="py-2.5 px-4">Typical Range</th>
                <th className="py-2.5 px-4">Optimal Threshold</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Soil Available Nitrogen</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">kg / ha</td>
                <td className="py-2.5 px-4">20.0 — 200.0</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">75.0 — 120.0</td>
                <td className="py-2.5 px-4 text-slate-500">Primary vegetative macronutrient determining yield capacity</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Root-Zone Soil Moisture</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">%</td>
                <td className="py-2.5 px-4">10.0 — 50.0</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">25.0 — 35.0</td>
                <td className="py-2.5 px-4 text-slate-500">Volumetric water content in top 30cm soil column</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Cumulative Seasonal Rainfall</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">mm</td>
                <td className="py-2.5 px-4">150.0 — 1200.0</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">400.0 — 700.0</td>
                <td className="py-2.5 px-4 text-slate-500">Total precipitation received throughout crop growth cycle</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Satellite Canopy NDVI</td>
                <td className="py-2.5 px-4 font-mono text-[11px]">index (0-1)</td>
                <td className="py-2.5 px-4">0.10 — 0.95</td>
                <td className="py-2.5 px-4 text-emerald-800 font-medium">0.70 — 0.88</td>
                <td className="py-2.5 px-4 text-slate-500">Copernicus Sentinel-2 Band 8 (NIR) & Band 4 (Red) ratio</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Support & Contact Strip */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-semibold text-xs">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">Technical Agronomy Support</div>
            <div className="text-[11px] text-slate-500">Contact our agronomic engineering team for enterprise integration assistance</div>
          </div>
        </div>
        <a
          href="mailto:support@agriquantum.ai"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
        >
          <span>Email Support Team</span>
        </a>
      </div>
    </div>
  );
}
