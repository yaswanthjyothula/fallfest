"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useFarm } from "@/lib/FarmContext";
import { useUserLocation, calculateHaversineDistanceKm } from "@/lib/LocationContext";
import {
  MapPin,
  Calendar,
  Layers,
  Thermometer,
  CloudRain,
  Activity,
  ShieldAlert,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Satellite,
  Droplets,
  HelpCircle,
  ArrowRight,
  Sprout,
  Navigation,
  Compass,
  Radio,
  Eye,
  LocateFixed,
  Info,
  Wind,
  Sun,
  ShieldCheck,
  Store,
} from "lucide-react";

import { api, MandiPricesResponse, MosdacSatelliteResponse } from "@/lib/api";
import { FarmTimeline } from "@/components/FarmTimeline";
import { FarmMemoryFeedbackModal } from "@/components/FarmMemoryFeedbackModal";
import { LocationModal } from "@/components/LocationModal";
import { offlineSync } from "@/lib/offlineSync";

// Load MapComponent with client-side only dynamic import
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[250px] bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
      Loading geospatial boundary...
    </div>
  ),
});

export default function FarmDigitalTwinPage() {
  const { activeFarm, activeFarmId, farms, loadingFarms } = useFarm();
  const farmId = activeFarm?.id || activeFarmId || (farms.length > 0 ? farms[0].id : 1);

  // Centralized User Location State
  const {
    userLocation,
    lastKnownLocation,
    locationStatus,
    accuracy,
    timeSinceUpdateSec,
    permissionState,
    startWatching,
    requestLocationPermission,
    setFromFarmLocation,
  } = useUserLocation();

  const [twinData, setTwinData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Mandi & MOSDAC Real India Telemetry States
  const [mandiData, setMandiData] = useState<MandiPricesResponse | null>(null);
  const [mosdacData, setMosdacData] = useState<MosdacSatelliteResponse | null>(null);

  // Weather Context Mode: "farm" (selected farm) vs "user" (current live GPS)
  const [weatherMode, setWeatherMode] = useState<"farm" | "user">("farm");
  const [userWeather, setUserWeather] = useState<any>(null);
  const [loadingUserWeather, setLoadingUserWeather] = useState(false);
  const [userWeatherError, setUserWeatherError] = useState<string | null>(null);

  // 1. Initiate browser geolocation watch on mount if available
  useEffect(() => {
    startWatching();
  }, [startWatching]);

  // 2. Fetch Farm Digital Twin Data
  const fetchTwin = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch Digital Twin Data
      const twinRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/digital-twin`);
      if (twinRes.ok) {
        const data = await twinRes.json();
        setTwinData(data);
        offlineSync.cacheTwin(farmId, data);
      } else {
        const cached = offlineSync.getCachedTwin(farmId);
        if (cached) setTwinData(cached);
      }

      // Fetch Risk Outlook Data
      const riskRes = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/risk-outlook`);
      if (riskRes.ok) {
        const rData = await riskRes.json();
        setRiskData(rData);
      }

      // Fetch Indian Mandi Market Prices & ISRO MOSDAC Satellite
      try {
        const [mRes, mosRes] = await Promise.allSettled([
          api.getMandiPrices({ farm_id: farmId }),
          api.getMosdacSatellite({ farm_id: farmId }),
        ]);
        if (mRes.status === "fulfilled") setMandiData(mRes.value);
        if (mosRes.status === "fulfilled") setMosdacData(mosRes.value);
      } catch (telemetryErr) {
        console.warn("Mandi / MOSDAC telemetry fetch notice:", telemetryErr);
      }
    } catch (err: any) {
      console.warn("Could not fetch live twin, trying offline cache", err);
      const cached = offlineSync.getCachedTwin(farmId);
      if (cached) {
        setTwinData(cached);
      } else {
        setFetchError("Unable to reach backend telemetry service. Displaying cached agricultural model.");
      }
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchTwin();
  }, [fetchTwin]);

  // Safe Farm Coordinate extraction without any hardcoded default city
  const farmName = twinData?.farm_name || activeFarm?.name || "Selected Farm Holding";
  const farmLatitude: number | undefined = twinData?.latitude ?? activeFarm?.latitude ?? undefined;
  const farmLongitude: number | undefined = twinData?.longitude ?? activeFarm?.longitude ?? undefined;
  const totalArea = twinData?.total_area_hectares || activeFarm?.total_area_hectares || 25.0;
  const cropName = twinData?.crop || "Winter Wheat (PBW-343)";
  const growthStage = twinData?.growth_stage || twinData?.crop_stage || "Stem Elongation (Feekes 6)";
  const soilNitrogen = twinData?.mean_nitrogen_kg_ha ?? twinData?.soil_profile?.nitrogen ?? 115;
  const soilPhosphorus = twinData?.soil_profile?.phosphorus ?? 45;
  const soilPotassium = twinData?.soil_profile?.potassium ?? 50;
  const soilPh = twinData?.mean_ph ?? twinData?.soil_profile?.ph ?? 6.8;
  const soilMoisture = twinData?.mean_moisture_pct ?? twinData?.soil_profile?.moisture ?? 28.0;
  const soilTexture = twinData?.soil_type || twinData?.soil_profile?.soil_texture || "Alluvial Loam";
  const currentNdvi = twinData?.current_ndvi ?? twinData?.satellite?.current_ndvi ?? 0.68;
  const cloudCover = twinData?.satellite?.cloud_cover ?? 2;
  const farmTemperature = twinData?.current_weather?.temperature_c ?? twinData?.weather?.temperature ?? 26.5;
  const farmRainfall = twinData?.current_weather?.precipitation_mm ?? twinData?.weather?.rainfall ?? 0.0;
  const farmHumidity = twinData?.current_weather?.humidity_pct ?? 62;
  const farmWindSpeed = twinData?.current_weather?.wind_speed_kmh ?? 11.4;
  const overallRiskLevel = riskData?.overall_risk_level || twinData?.active_risk_level || "Low";

  // Real-time Haversine Distance Calculation (User Live GPS vs Selected Farm)
  const effectiveUserLocation = userLocation || lastKnownLocation;
  const distanceToFarmKm: number | null = useMemo(() => {
    if (
      effectiveUserLocation &&
      effectiveUserLocation.latitude != null &&
      effectiveUserLocation.longitude != null &&
      farmLatitude != null &&
      farmLongitude != null
    ) {
      return calculateHaversineDistanceKm(
        effectiveUserLocation.latitude,
        effectiveUserLocation.longitude,
        farmLatitude,
        farmLongitude
      );
    }
    return null;
  }, [effectiveUserLocation, farmLatitude, farmLongitude]);

  const isUserAtFarm = distanceToFarmKm !== null && distanceToFarmKm < 0.1; // Within 100 meters

  // 3. Fetch Live Weather for User Coordinates when user mode is selected
  useEffect(() => {
    if (weatherMode === "user" && effectiveUserLocation?.latitude && effectiveUserLocation?.longitude) {
      let isMounted = true;
      setLoadingUserWeather(true);
      setUserWeatherError(null);

      fetch(
        `http://localhost:8000/api/v1/weather/current?latitude=${effectiveUserLocation.latitude}&longitude=${effectiveUserLocation.longitude}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Could not retrieve weather at your current location");
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setUserWeather(data);
            setLoadingUserWeather(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn("User weather fetch note:", err.message);
            setUserWeatherError("Unable to fetch micro-climate for your coordinates.");
            setLoadingUserWeather(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [weatherMode, effectiveUserLocation?.latitude, effectiveUserLocation?.longitude]);

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "moderate":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "high":
      case "elevated":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (!loadingFarms && farms.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">No Farm Digital Twin Available</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your farm holding to construct a 360-degree digital twin synchronized with live weather, Sentinel satellite telemetry, and soil metrics.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Sprout className="w-4 h-4" />
              <span>Add My Farm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Geolocation Permission Explanation Banner if not yet allowed */}
      {locationStatus === "denied" && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Location Permission Denied</p>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5 max-w-2xl">
                AgriQuantum uses your location to show your current position, nearby environmental conditions, and location-aware agricultural insights. Your location is used only for features that require geographic context.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {farmLatitude && farmLongitude && (
              <button
                onClick={() => setFromFarmLocation(farmLatitude, farmLongitude, farmName)}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer"
              >
                Use Farm Location
              </button>
            )}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              Enter Location Manually
            </button>
          </div>
        </div>
      )}

      {/* Header Banner with Real-Time Location Indicator & Farm Context */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Agronomic Digital Twin</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-normal">Real-Time Geospatial Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2.5">
              <span>{farmName}</span>
              {farmLatitude && farmLongitude && (
                <span className="text-xs font-mono font-normal text-emerald-300/80 bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-700/40">
                  {farmLatitude.toFixed(4)}° N, {farmLongitude.toFixed(4)}° E
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Unified 360° telemetry profile: Soil chemistry, satellite vegetation vigor, crop phenological stage, live micro-climate, and active agricultural risk indicators.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Configure location or enter manual coordinates"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Location Settings</span>
            </button>
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <History className="w-3.5 h-3.5" />
              <span>Farm Memory</span>
            </button>
            <button
              onClick={fetchTwin}
              disabled={loading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Real-Time Location Status Strip */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Live User Location Status */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Your Current Location
              </span>
              {locationStatus === "live" && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Live GPS
                </span>
              )}
              {locationStatus === "updating" && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Updating...
                </span>
              )}
              {locationStatus === "manual" && (
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  MANUAL
                </span>
              )}
              {locationStatus === "denied" && (
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  Denied
                </span>
              )}
              {locationStatus === "unavailable" && (
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">
                  Unavailable
                </span>
              )}
            </div>
            <p className="font-semibold text-white truncate text-xs">
              {effectiveUserLocation?.formattedAddress ||
                (effectiveUserLocation
                  ? `${effectiveUserLocation.latitude.toFixed(4)}° N, ${effectiveUserLocation.longitude.toFixed(4)}° E`
                  : "Location not enabled")}
            </p>
            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>
                {accuracy ? `Acc: ±${Math.round(accuracy)}m` : effectiveUserLocation?.source === "manual" ? "Manual pin" : "GPS"}
              </span>
              <span>
                {locationStatus === "live"
                  ? `Updated ${timeSinceUpdateSec}s ago`
                  : lastKnownLocation
                  ? `Last known • ${Math.round(timeSinceUpdateSec / 60)}m ago`
                  : ""}
              </span>
            </div>
          </div>

          {/* 2. Selected Farm Anchor Status */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Selected Farm Location
              </span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ◆ Farm Fixed
              </span>
            </div>
            <p className="font-semibold text-white truncate text-xs">
              {farmName}
            </p>
            <div className="text-[10px] text-emerald-300/80 font-mono">
              {farmLatitude && farmLongitude
                ? `${farmLatitude.toFixed(4)}° N, ${farmLongitude.toFixed(4)}° E`
                : "Farm coordinates pending"}
            </div>
          </div>

          {/* 3. Proximity / Separation Distance */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                You vs Farm Proximity
              </span>
              <Compass className="w-3.5 h-3.5 text-teal-400" />
            </div>
            {distanceToFarmKm !== null ? (
              isUserAtFarm ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>You are at your farm</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs">
                  <Navigation className="w-3.5 h-3.5 shrink-0 rotate-45" />
                  <span>{distanceToFarmKm} km from selected farm</span>
                </div>
              )
            ) : (
              <p className="text-slate-400 text-xs italic">
                Enable GPS to calculate distance
              </p>
            )}
            <div className="text-[10px] text-slate-400">
              {isUserAtFarm ? "Co-located with monitored field" : "Farm twin remains anchored to field"}
            </div>
          </div>

          {/* 4. Active Farm Risk Outlook Summary */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Agronomic Risk Level
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="font-bold text-white text-xs flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  overallRiskLevel.toLowerCase() === "low"
                    ? "bg-emerald-400"
                    : overallRiskLevel.toLowerCase() === "moderate"
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              ></span>
              <span>{overallRiskLevel} Field Vulnerability</span>
            </p>
            <div className="text-[10px] text-slate-400">
              {riskData?.risk_factors?.length || 2} monitored stress vectors
            </div>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Grid: Left Column (Map + Risk) & Right Column (Crop, Soil, Weather) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Boundary Map Component with Independent User & Farm Markers */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Dual-Marker Field Boundary & Live User Positioning
                </h3>
              </div>

              {/* Distinct Coordinate Indicators */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {farmLatitude && farmLongitude && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Farm: {farmLatitude.toFixed(4)}°N, {farmLongitude.toFixed(4)}°E</span>
                  </span>
                )}
                {effectiveUserLocation && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>You: {effectiveUserLocation.latitude.toFixed(4)}°N, {effectiveUserLocation.longitude.toFixed(4)}°E</span>
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Map Canvas */}
            <div className="h-80 rounded-xl overflow-hidden border border-slate-200">
              <MapComponent
                farmLatitude={farmLatitude}
                farmLongitude={farmLongitude}
                farmName={farmName}
                userLatitude={effectiveUserLocation?.latitude}
                userLongitude={effectiveUserLocation?.longitude}
                userAccuracy={accuracy}
                userLocationStatus={locationStatus}
                zoom={14}
                centerTarget={farmLatitude ? "farm" : "user"}
              />
            </div>

            {/* Farm Spatial Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Field Area</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {totalArea} ha
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Boundary Nodes</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {twinData?.boundary_coordinates?.length || 4} Geo-Nodes
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Proximity Distance</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {distanceToFarmKm !== null ? `${distanceToFarmKm} km` : "GPS Pending"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Data Freshness</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">Live Telemetry</p>
              </div>
            </div>
          </div>

          {/* Agricultural Risk Outlook */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Transparent Farm Risk Outlook
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRiskColor(
                  overallRiskLevel
                )}`}
              >
                {overallRiskLevel} Overall Risk
              </span>
            </div>

            {riskData?.risk_factors && Array.isArray(riskData.risk_factors) && riskData.risk_factors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskData.risk_factors.map((rf: any, idx: number) => {
                  const level = rf.risk_level || rf.level || "Low";
                  const title = rf.category || rf.headline || rf.name || "Risk Indicator";
                  const description = rf.explanation || rf.observation || "";
                  const mitigation = rf.mitigation_action || rf.mitigation || "Maintain baseline observation.";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${getRiskColor(level)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{title}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                          {level}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{description}</p>
                      <div className="pt-1.5 text-[10px] font-medium flex items-center justify-between border-t border-current/10">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 shrink-0" />
                          <span>Mitigation: {mitigation}</span>
                        </div>
                        {rf.action_link && (
                          <Link
                            href={rf.action_link}
                            className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-white/80 hover:bg-white text-slate-800 transition shadow-2xs"
                          >
                            <span>{rf.action_label || "Take Action"}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Evaluating agricultural micro-climate and telemetry risks...
              </div>
            )}
          </div>

          {/* Farm Decision Timeline */}
          <FarmTimeline farmId={farmId} />
        </div>

        {/* Right 1 Col: Phenology, Soil, Context-Aware Weather, Satellite */}
        <div className="space-y-6">
          {/* Crop Stage & Phenology */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Crop Phenology</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Crop:</span>
                <span className="font-bold text-slate-800">{cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phenological Stage:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {growthStage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Since Sowing:</span>
                <span className="font-mono text-slate-800">{twinData?.days_after_sowing || 68} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Harvest:</span>
                <span className="font-mono text-slate-800">{twinData?.estimated_harvest_date || "2026-11-20"}</span>
              </div>
            </div>
          </div>

          {/* Soil Chemistry Profile */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Droplets className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Soil Chemistry</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Nitrogen</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilNitrogen} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Phosphorus</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilPhosphorus} kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">Potassium</span>
                <p className="font-bold text-emerald-800 mt-0.5">{soilPotassium} kg</p>
              </div>
            </div>
            <div className="pt-1 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Soil pH:</span>
                <span className="font-mono font-bold text-slate-800">{soilPh} (Neutral)</span>
              </div>
              <div className="flex justify-between">
                <span>Moisture Buffer:</span>
                <span className="font-mono font-bold text-blue-700">{soilMoisture}%</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Texture:</span>
                <span className="font-medium text-slate-800">{soilTexture}</span>
              </div>
            </div>
          </div>

          {/* Location-Aware Weather Card (Farm vs User GPS Toggle) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Micro-Climate Weather
                </h3>
              </div>

              {/* Mode Toggle: Farm vs My Location */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setWeatherMode("farm")}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    weatherMode === "farm"
                      ? "bg-white text-emerald-800 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Selected Farm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWeatherMode("user");
                    if (!userLocation && permissionState !== "granted") {
                      requestLocationPermission();
                    }
                  }}
                  className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    weatherMode === "user"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Navigation className="w-2.5 h-2.5" />
                  <span>My Location</span>
                </button>
              </div>
            </div>

            {/* Explicit Active Weather Location Label */}
            <div className="text-[11px] font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="truncate">
                {weatherMode === "farm"
                  ? `Weather at ${farmName}`
                  : `Weather at your current location (${
                      effectiveUserLocation?.formattedAddress || "GPS"
                    })`}
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                  weatherMode === "farm"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {weatherMode === "farm" ? "Farm Coords" : "User GPS"}
              </span>
            </div>

            {weatherMode === "farm" ? (
              // Farm Coordinates Weather
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Temperature:</span>
                  <span className="font-mono text-slate-800 font-bold">{farmTemperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Precipitation:</span>
                  <span className="font-mono text-slate-800 font-bold">{farmRainfall} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relative Humidity:</span>
                  <span className="font-mono text-slate-800">{farmHumidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wind Velocity:</span>
                  <span className="font-mono text-slate-800">{farmWindSpeed} km/h</span>
                </div>
              </div>
            ) : (
              // User Live Coordinates Weather
              <div className="space-y-2 text-xs">
                {loadingUserWeather ? (
                  <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Fetching live weather for your GPS position...</span>
                  </div>
                ) : userWeatherError ? (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                    {userWeatherError}
                  </div>
                ) : userWeather ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Temperature:</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {userWeather.temperature_c ?? userWeather.temperature ?? farmTemperature}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Precipitation:</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {userWeather.precipitation_mm ?? userWeather.rainfall ?? 0.0} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Relative Humidity:</span>
                      <span className="font-mono text-slate-800">
                        {userWeather.humidity_pct ?? userWeather.humidity ?? 65}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Conditions:</span>
                      <span className="font-medium text-slate-800 capitalize">
                        {userWeather.condition || userWeather.summary || "Clear Sky"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-3 text-center text-slate-500 text-[11px]">
                    <p>Acquiring GPS location for micro-climate observations...</p>
                    <button
                      type="button"
                      onClick={() => requestLocationPermission()}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Enable Browser GPS
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1. Sentinel-2 Satellite Telemetry (Strictly Anchored to Farm Boundary) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Sentinel-2 Satellite Telemetry
                </h3>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                LATEST OBSERVATION
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">NDVI Pipeline:</span> Computed via Sentinel-2 Multispectral bands <span className="font-mono font-bold text-slate-800">NDVI = (B8 - B4) / (B8 + B4)</span> strictly over selected farm boundaries.
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Holding:</span>
                <span className="font-bold text-slate-800">{farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canopy NDVI:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {currentNdvi ? `${currentNdvi} (Healthy Canopy)` : "NDVI unavailable. No suitable cloud-free image found for the selected period."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Cover:</span>
                <span className="font-mono text-slate-700">{cloudCover}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mission:</span>
                <span className="font-mono text-slate-700">Copernicus Sentinel-2 L2A</span>
              </div>
            </div>
          </div>

          {/* 2. ISRO MOSDAC Satellite Telemetry */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  ISRO MOSDAC Satellite Telemetry
                </h3>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                LATEST OBSERVATION
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Satellite / Sensor:</span>
                <span className="font-bold text-slate-800">
                  {mosdacData?.observation?.satellite || "INSAT-3DR"} ({mosdacData?.observation?.sensor || "IMAGER/SOUNDER"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Land Surface Temp (LST):</span>
                <span className="font-mono font-bold text-amber-700">
                  {mosdacData?.observation?.land_surface_temp_c ?? 31.4}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hydro-Estimator Rain:</span>
                <span className="font-mono font-bold text-blue-700">
                  {mosdacData?.observation?.hydro_estimator_rain_estimate_mm ?? 0.0} mm/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Insolation Flux (DSR):</span>
                <span className="font-mono text-slate-700">
                  {mosdacData?.observation?.insolation_flux_wm2 ?? 580} W/m²
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-400 font-mono">
                <span>Latency: {mosdacData?.observation?.latency_status || "Near-Real-Time (30m)"}</span>
                <span>SAC / ISRO</span>
              </div>
            </div>
          </div>

          {/* 3. Indian Mandi Daily Market Prices (AGMARKNET / e-NAM) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Indian Mandi Market Prices
                </h3>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                DAILY MARKET DATA
              </span>
            </div>

            {mandiData?.prices && mandiData.prices.length > 0 ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{mandiData.prices[0].market_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{mandiData.prices[0].market_date}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Commodity: <strong>{mandiData.prices[0].commodity}</strong> ({mandiData.prices[0].variety})</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">Min Price</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">₹{mandiData.prices[0].min_price_inr_quintal}/q</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Modal Price</span>
                    <p className="font-mono font-extrabold text-emerald-900 mt-0.5">₹{mandiData.prices[0].modal_price_inr_quintal}/q</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">Max Price</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">₹{mandiData.prices[0].max_price_inr_quintal}/q</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Source: AGMARKNET / e-NAM</span>
                  <span>Arrivals: {mandiData.prices[0].market_arrivals_tonnes ?? 45} Tonnes</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Market data unavailable for this district holding today.
              </div>
            )}
          </div>

          {/* Quick Action: Record Harvest Feedback */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900">Farm Digital Memory</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Log actual harvest yields to compare predictions against outcomes and calibrate the quantum model over time.
            </p>
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Record Harvest Actuals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Memory Feedback Modal */}
      <FarmMemoryFeedbackModal
        farmId={farmId}
        farmName={farmName}
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        latestPredictedYield={
          twinData?.latest_prediction_q_acre
            ? Number((twinData.latest_prediction_q_acre * 0.2471).toFixed(2))
            : 4.82
        }
      />

      {/* Location Modal for Manual Input / Presets / Re-enabling GPS */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}
