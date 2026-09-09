"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  CloudSun,
  Sprout,
  ShoppingBag,
  Satellite,
  Radio,
  ExternalLink,
  ShieldCheck,
  Clock,
  MapPin,
  FileCheck2,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  Tag
} from "lucide-react";
import { api, DataSourcesManifestResponse } from "@/lib/api";

interface DataSourceCard {
  id: string;
  category: "weather" | "yield" | "market" | "satellite" | "mosdac";
  title: string;
  authority: string;
  ministry: string;
  portalUrl: string;
  dataType: string;
  freshnessBadge: string;
  updateCadence: string;
  spatialCoverage: string;
  description: string;
  metrics: string[];
  sampleEndpoint: string;
  verifiedStatus: string;
}

const SOURCES: DataSourceCard[] = [
  {
    id: "imd_weather",
    category: "weather",
    title: "India Meteorological Department (IMD)",
    authority: "National Weather Forecasting Centre / Mausam",
    ministry: "Ministry of Earth Sciences, Government of India",
    portalUrl: "https://mausam.imd.gov.in",
    dataType: "Agro-Meteorological Telemetry & Forecasts",
    freshnessBadge: "OBSERVED / FORECAST",
    updateCadence: "10-15 min live station observations, 7-day forecast envelopes, 3-hour Doppler nowcasts",
    spatialCoverage: "Pan-India: 28 States, 8 Union Territories, Agromet Observatories",
    description:
      "Official primary weather provider for Indian agricultural operations. Telemetry streams validated surface temperature, humidity, rainfall, wind velocity, and Doppler radar reflectivity without synthetic substitutions.",
    metrics: [
      "Surface Temperature (°C)",
      "Feels-Like Apparent Temperature (°C)",
      "Relative Humidity (%)",
      "Precipitation & Probability (mm / %)",
      "Surface Wind Velocity & Direction",
      "Severe Agromet Weather Warnings",
      "Doppler Radar Nowcasts (2-3 hrs)"
    ],
    sampleEndpoint: "/api/v1/weather/intelligence/{farm_id}",
    verifiedStatus: "Tier 1 Active Primary Service"
  },
  {
    id: "des_crop_yield",
    category: "yield",
    title: "Directorate of Economics & Statistics (DES)",
    authority: "Department of Agriculture & Farmers Welfare (DA&FW)",
    ministry: "Ministry of Agriculture & Farmers Welfare, Government of India",
    portalUrl: "https://aps.dac.gov.in",
    dataType: "Historical Area, Production & Yield (APY) Statistics",
    freshnessBadge: "HISTORICAL / MODEL GENERATED",
    updateCadence: "Seasonal Advance & Final Estimates (Kharif, Rabi, Zaid, Annual)",
    spatialCoverage: "District-level agrarian census across all 28 Indian States",
    description:
      "Authoritative historical crop yield dataset used strictly for ML/QML model training, cross-validation, and agronomic benchmarks. Staged and cleaned in data/india_crop_yield_training.csv with zero fabricated rows.",
    metrics: [
      "Cultivated Area (Hectares)",
      "Total Production (Tonnes)",
      "Crop Yield (Tonnes/Hectare)",
      "Aligned IMD Seasonal Rainfall (mm)",
      "ICAR Soil Health Chemistry (pH, N, P, K)",
      "Sentinel-2 Baseline Phenology (NDVI)"
    ],
    sampleEndpoint: "/api/v1/models/benchmark",
    verifiedStatus: "Grounded DES Source File (data/india_crop_yield_training.csv)"
  },
  {
    id: "agmarknet_market",
    category: "market",
    title: "AGMARKNET & e-NAM Mandi Market Network",
    authority: "Directorate of Marketing & Inspection (DMI) / SFAC",
    ministry: "Ministry of Agriculture & Farmers Welfare, Government of India",
    portalUrl: "https://agmarknet.gov.in",
    dataType: "Daily Mandi Commodity Prices & Arrivals",
    freshnessBadge: "DAILY MARKET DATA",
    updateCadence: "Daily market closure bulletin (Never falsely marked as per-second live)",
    spatialCoverage: "Regulated APMC Mandis across all Indian Agricultural Hubs",
    description:
      "Integrates official daily agricultural market data covering wholesale trading across major Indian APMCs. Displays Minimum, Modal, and Maximum prices (₹/Quintal) and daily arrivals for crop economic valuation.",
    metrics: [
      "Minimum Price (₹/Quintal)",
      "Modal Trade Price (₹/Quintal)",
      "Maximum Price (₹/Quintal)",
      "Daily Market Arrivals (Tonnes)",
      "Commodity Variety & Grading",
      "APMC Market Yard Name & District"
    ],
    sampleEndpoint: "/api/v1/market/prices?state=Punjab&crop=Wheat",
    verifiedStatus: "Active Daily Market Gateway"
  },
  {
    id: "copernicus_sentinel",
    category: "satellite",
    title: "Copernicus Sentinel-2 Multispectral Earth Observation",
    authority: "European Space Agency (ESA) & European Commission",
    portalUrl: "https://dataspace.copernicus.eu",
    dataType: "10m Multispectral Surface Reflectance (Level-2A)",
    freshnessBadge: "LATEST OBSERVATION",
    updateCadence: "5-day constellation revisit interval (Labeled as Latest Observation, never 'live')",
    spatialCoverage: "High-resolution 10m spatial grid bounded to user farm boundaries",
    description:
      "Calculates authentic Normalized Difference Vegetation Index (NDVI) strictly using Band 4 (Red: 665nm) and Band 8 (NIR: 842nm). If imagery is cloud-masked or unavailable, returns explicit notice with zero synthetic substitutions.",
    metrics: [
      "Band 4 Red (665nm BOA Reflectance)",
      "Band 8 NIR (842nm BOA Reflectance)",
      "NDVI = (B8 - B4) / (B8 + B4)",
      "Atmospheric Cloud Mask Screening",
      "Observation Timestamp (IST)",
      "Spatial Canopy Management Grid"
    ],
    sampleEndpoint: "/api/v1/satellite/crop-health/{field_id}",
    verifiedStatus: "Validated Mathematical Band Pipeline"
  },
  {
    id: "isro_mosdac",
    category: "mosdac",
    title: "ISRO MOSDAC Space Applications Centre",
    authority: "Meteorological and Oceanographic Satellite Data Archival Centre",
    ministry: "Department of Space, Indian Space Research Organisation (ISRO)",
    portalUrl: "https://mosdac.gov.in",
    dataType: "Geostationary Meteorological & Earth Observation Imagery",
    freshnessBadge: "LATEST OBSERVATION",
    updateCadence: "15-30 min scan cadence with 45-min georectification & processing latency",
    spatialCoverage: "Indian Subcontinent, Arabian Sea, Bay of Bengal, Agro-climatic Zones",
    description:
      "Provides verified satellite products from INSAT-3D and INSAT-3DR Imagers. Delivers Land Surface Temperature (LST), Hydro-Estimator Precipitation (HEM), and Daily Surface Solar Radiation (DSR) for regional agronomy.",
    metrics: [
      "INSAT-3DR Land Surface Temp (LST, °C)",
      "Hydro-Estimator Rainfall Rate (mm/hr)",
      "Daily Surface Solar Radiation (W/m²)",
      "Visible (0.65µm) & TIR1 (10.8µm) Radiance",
      "Sensor Acquisition Cycle Timestamp (IST)",
      "MOSDAC Archive Catalog Integration"
    ],
    sampleEndpoint: "/api/v1/satellite/mosdac?latitude=16.3067&longitude=80.4365",
    verifiedStatus: "Integrated ISRO Sensor Architecture"
  }
];

export default function DataSourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [manifestData, setManifestData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testedEndpoint, setTestedEndpoint] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState<boolean>(false);

  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await api.getDataSources();
        setManifestData(res.sources);
      } catch (err) {
        console.warn("Could not load remote manifest:", err);
      } finally {
        setLoading(false);
      }
    }
    loadManifest();
  }, []);

  const handleTestEndpoint = async (endpoint: string) => {
    setTesting(true);
    setTestedEndpoint(endpoint);
    setTestResult(null);

    try {
      if (endpoint.includes("market/prices")) {
        const res = await api.getMandiPrices({ state: "Punjab", crop: "Wheat" });
        setTestResult(res);
      } else if (endpoint.includes("satellite/mosdac")) {
        const res = await api.getMosdacSatellite({ latitude: 16.3067, longitude: 80.4365 });
        setTestResult(res);
      } else if (endpoint.includes("weather/intelligence")) {
        const res = await api.getWeatherIntelligence(1);
        setTestResult(res);
      } else {
        const res = await api.getDataSources();
        setTestResult(res);
      }
    } catch (err: any) {
      setTestResult({ status: "Error", message: err.message || "Endpoint fetch error" });
    } finally {
      setTesting(false);
    }
  };

  const filteredSources = SOURCES.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.metrics.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official India Data Sources & Provenance
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Data Sources & Traceability Manifest
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Every metric across AgriQuantum originates from verified Government of India agencies,
            the India Meteorological Department (IMD), Copernicus Sentinel-2, or ISRO MOSDAC.
            Zero synthetic data substitutions in production.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/twin"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Layers className="w-4 h-4" />
            View Digital Twin
          </Link>
        </div>
      </div>

      {/* Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            Geographic Scope
          </div>
          <div className="text-lg font-bold text-white">India Only</div>
          <div className="text-xs text-slate-400 mt-1">
            Strictly 28 States & 8 Union Territories. Non-Indian coordinates rejected with verified message.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            Timezone Standard
          </div>
          <div className="text-lg font-bold text-white">Asia/Kolkata (IST)</div>
          <div className="text-xs text-slate-400 mt-1">
            All telemetry, satellite acquisitions, and market closure timestamps rendered in Indian Standard Time.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5" />
            Freshness Policy
          </div>
          <div className="text-lg font-bold text-white">Accurate Badges</div>
          <div className="text-xs text-slate-400 mt-1">
            Strict labeling: LIVE (GPS), OBSERVED (Weather), FORECAST (7-Day), DAILY MARKET, LATEST OBSERVATION.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            Source Grounding
          </div>
          <div className="text-lg font-bold text-white">Zero Fake Numbers</div>
          <div className="text-xs text-slate-400 mt-1">
            When imagery or feeds are offline, explicit unavailability notices are returned instead of fabricated values.
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: "all", label: "All Sources (5)" },
            { id: "weather", label: "IMD Weather" },
            { id: "yield", label: "DES Crop Yield" },
            { id: "market", label: "AGMARKNET / e-NAM" },
            { id: "satellite", label: "Sentinel-2 NDVI" },
            { id: "mosdac", label: "ISRO MOSDAC" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agencies, metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Data Source Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {source.freshnessBadge}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {source.verifiedStatus}
                </span>
              </div>

              {/* Title & Authority */}
              <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition">
                {source.title}
              </h2>
              <div className="text-xs text-emerald-400/90 font-medium mt-0.5">
                {source.authority}
              </div>
              <div className="text-[11px] text-slate-400 mb-4">
                {source.ministry}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {source.description}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 mb-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Cadence / Refresh:</span>
                  <span className="text-slate-200 font-medium">{source.updateCadence}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Spatial Coverage:</span>
                  <span className="text-slate-200 font-medium">{source.spatialCoverage}</span>
                </div>
              </div>

              {/* Monitored Metrics Chips */}
              <div className="mb-4">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Monitored Agronomic Metrics:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {source.metrics.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
              <a
                href={source.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                Official Portal
              </a>

              <button
                onClick={() => handleTestEndpoint(source.sampleEndpoint)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] border border-slate-700 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Test API Trace
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive API Trace Inspection Drawer */}
      {testedEndpoint && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live API Endpoint Trace
              </div>
              <div className="text-sm font-mono text-white mt-1">
                GET {testedEndpoint}
              </div>
            </div>
            <button
              onClick={() => {
                setTestedEndpoint(null);
                setTestResult(null);
              }}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            {testing ? (
              <div className="flex items-center gap-3 text-slate-400 text-xs py-8 justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Querying verified agency gateway...
              </div>
            ) : testResult ? (
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
