"use client";

import React, { useState, useEffect } from "react";
import { Leaf, Satellite, AlertTriangle, ShieldCheck, TrendingUp, Calendar, Info, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";

export default function CropHealthPage() {
  const { farms, activeFarmId, setActiveFarmId, activeFarm } = useFarm();
  const [cropHealth, setCropHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        setLoading(true);
        const data = await api.getSatelliteCropHealth(activeFarmId || 1);
        setCropHealth(data);
      } catch (err) {
        console.warn("Failed to load satellite crop health:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, [activeFarmId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Satellite Crop Health
          </h2>
          <p className="text-xs text-slate-500">
            Multispectral Level-2A surface reflectance computing Normalized Difference Vegetation Index (B08 NIR vs B04 Red).
          </p>
        </div>

        {/* Farm Option Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <select
            value={activeFarmId || 1}
            onChange={(e) => setActiveFarmId(Number(e.target.value))}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-600 cursor-pointer shadow-2xs"
            aria-label="Select active farm for satellite health"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.location})
              </option>
            ))}
          </select>
        </div>
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
