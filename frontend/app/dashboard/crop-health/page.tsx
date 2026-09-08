"use client";

import React, { useState, useEffect } from "react";
import { Leaf, Satellite, AlertTriangle, ShieldCheck, TrendingUp, Calendar, Info } from "lucide-react";
import { api } from "@/lib/api";

export default function CropHealthPage() {
  const [cropHealth, setCropHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        setLoading(true);
        const data = await api.getSatelliteCropHealth(1);
        setCropHealth(data);
      } catch (err) {
        console.warn("Failed to load satellite crop health:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Satellite Crop Health
        </h2>
        <p className="text-xs text-slate-500">
          Multispectral Level-2A surface reflectance computing Normalized Difference Vegetation Index (B08 NIR vs B04 Red).
        </p>
      </div>

      {cropHealth && !cropHealth.credentials_configured && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Copernicus OAuth Credentials Status: Baseline Mode</span>
          </div>
          <p className="leading-relaxed">
            Live Copernicus Data Space OAuth keys (<code className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">COPERNICUS_CLIENT_ID</code>) are operating under simulated agronomic baseline parameters. To bind live 5-day Sentinel-2 satellite passes, update your Copernicus credentials in <code className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">.env</code>.
          </p>
        </div>
      )}

      {cropHealth && (
        <>
          {/* Main NDVI Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mean Canopy NDVI</span>
              <div className="text-3xl font-bold text-emerald-700 font-mono">
                {cropHealth.mean_ndvi.toFixed(3)}
              </div>
              <div className="text-xs text-slate-500">
                Healthy photosynthetic vigour (&gt; 0.65)
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phenological Stage</span>
              <div className="text-lg font-bold text-slate-900">
                {cropHealth.growth_stage}
              </div>
              <div className="text-xs text-slate-500">
                Winter Wheat (Triticum aestivum)
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NDVI Anomaly</span>
              <div className="text-2xl font-bold text-emerald-800 font-mono">
                {cropHealth.ndvi_anomaly >= 0 ? `+${cropHealth.ndvi_anomaly}` : cropHealth.ndvi_anomaly}
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Above 5-year regional baseline
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Obscuration</span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {cropHealth.cloud_coverage_pct}%
              </div>
              <div className="text-xs text-slate-500">
                Clear surface atmospheric pass
              </div>
            </div>
          </div>

          {/* Historical Trend Curve */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">30-Day Phenological NDVI Trend</h3>
                <p className="text-xs text-slate-500">Tracking vegetation canopy expansion throughout stem elongation</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Sentinel-2 L2A Multispectral
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
              {cropHealth.historical_ndvi_trend.map((point: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">{point.date}</span>
                  <div className="text-base font-bold text-emerald-700 font-mono">{point.ndvi}</div>
                  <span className="text-[10px] text-slate-400 block">Baseline: {point.baseline}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
