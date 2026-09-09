"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Navigation,
  CloudSun,
  Satellite,
  Atom,
  TrendingUp,
  ShieldAlert,
  DollarSign,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  RefreshCw,
  Clock,
} from "lucide-react";
import { api, Farm, Field, Crop } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";
import { useAuth } from "@/lib/AuthContext";

const CROPS_LIST = [
  { name: "Winter Wheat", variety: "PBW-343 / HD-2967", season: "Rabi", defaultN: 115, defaultP: 45, defaultK: 50, defaultPH: 6.8, defaultMoisture: 28 },
  { name: "Basmati Rice / Paddy", variety: "Pusa Basmati 1121 / Swarna", season: "Kharif", defaultN: 120, defaultP: 40, defaultK: 40, defaultPH: 6.5, defaultMoisture: 38 },
  { name: "Hybrid Maize (Corn)", variety: "DKC-9108 / Pioneer P3396", season: "Kharif", defaultN: 130, defaultP: 50, defaultK: 60, defaultPH: 6.7, defaultMoisture: 26 },
  { name: "Bt Cotton", variety: "RCH-659 BG II", season: "Kharif", defaultN: 140, defaultP: 55, defaultK: 65, defaultPH: 7.2, defaultMoisture: 24 },
  { name: "Soybean", variety: "JS-335 / JS-9560", season: "Kharif", defaultN: 40, defaultP: 60, defaultK: 40, defaultPH: 6.8, defaultMoisture: 30 },
  { name: "Sugarcane", variety: "Co-0238 / Co-86032", season: "Zaid", defaultN: 180, defaultP: 70, defaultK: 90, defaultPH: 7.0, defaultMoisture: 42 },
  { name: "Tomato", variety: "Abhinav / NS-501", season: "Rabi", defaultN: 110, defaultP: 60, defaultK: 80, defaultPH: 6.5, defaultMoisture: 32 },
  { name: "Potato", variety: "Kufri Jyoti / Kufri Pukhraj", season: "Rabi", defaultN: 140, defaultP: 80, defaultK: 100, defaultPH: 6.0, defaultMoisture: 30 },
  { name: "Groundnut (Peanut)", variety: "TAG-24 / Kadiri-6", season: "Kharif", defaultN: 30, defaultP: 50, defaultK: 50, defaultPH: 6.5, defaultMoisture: 22 },
  { name: "Mustard", variety: "Pusa Bold / Kranti", season: "Rabi", defaultN: 80, defaultP: 40, defaultK: 30, defaultPH: 7.0, defaultMoisture: 20 },
];

const SOIL_TYPES = [
  "Alluvial Loam",
  "Black Soil (Vertisol)",
  "Red Sandy Loam",
  "Clay Loam",
  "Laterite Soil",
  "Coastal Sandy Alluvium",
];

const GROWTH_STAGES = [
  "Early Vegetative / Seedling",
  "Tillering / Branching",
  "Stem Elongation / Jointing",
  "Flowering / Heading",
  "Grain Filling / Pod Development",
  "Maturity / Ripening",
];

export default function FarmManagementPage() {
  const router = useRouter();
  const { activeFarmId, setActiveFarmId, refreshFarms, farms } = useFarm();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"setup" | "farms" | "harvest">("setup");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [farmName, setFarmName] = useState("");
  const [locationName, setLocationName] = useState("Krishna River Basin (Zone 4B)");
  const [city, setCity] = useState("Guntur");
  const [stateName, setStateName] = useState("Andhra Pradesh");
  const [country, setCountry] = useState("India");
  const [latitude, setLatitude] = useState("16.5062");
  const [longitude, setLongitude] = useState("80.6480");
  const [totalArea, setTotalArea] = useState("25.0");
  const [areaUnit, setAreaUnit] = useState<"Hectares" | "Acres">("Hectares");

  const [selectedCrop, setSelectedCrop] = useState("Winter Wheat");
  const [cropVariety, setCropVariety] = useState("PBW-343 / HD-2967");
  const [season, setSeason] = useState("Rabi");
  const [growthStage, setGrowthStage] = useState("Stem Elongation / Jointing");
  const [plantingDate, setPlantingDate] = useState("2025-11-15");
  const [harvestDate, setHarvestDate] = useState("2026-03-30");

  const [nitrogen, setNitrogen] = useState("115.0");
  const [phosphorus, setPhosphorus] = useState("45.0");
  const [potassium, setPotassium] = useState("50.0");
  const [soilPh, setSoilPh] = useState("6.8");
  const [soilMoisture, setSoilMoisture] = useState("28.0");
  const [organicMatter, setOrganicMatter] = useState("0.75");
  const [soilType, setSoilType] = useState("Alluvial Loam");

  // Geolocation lookup state
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Analysis Progression State
  const [analyzingStep, setAnalyzingStep] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Harvest Feedback State
  const [harvestFarmId, setHarvestFarmId] = useState<number | null>(null);
  const [harvestCrop, setHarvestCrop] = useState("Winter Wheat");
  const [harvestSeason, setHarvestSeason] = useState("Rabi 2025-26");
  const [harvestActualYield, setHarvestActualYield] = useState("39.5");
  const [harvestPredictedYield, setHarvestPredictedYield] = useState("38.4");
  const [harvestActualN, setHarvestActualN] = useState("110.0");
  const [harvestActualWater, setHarvestActualWater] = useState("18.0");
  const [harvestNotes, setHarvestNotes] = useState("Supplemental drip irrigation applied during stem elongation.");
  const [harvestHistory, setHarvestHistory] = useState<any[]>([]);

  useEffect(() => {
    if (farms.length > 0 && !harvestFarmId) {
      setHarvestFarmId(farms[0].id);
      api.getHarvestHistory(farms[0].id).then(setHarvestHistory).catch(() => {});
    }
  }, [farms, harvestFarmId]);

  function handleCropChange(cropName: string) {
    setSelectedCrop(cropName);
    const found = CROPS_LIST.find((c) => c.name === cropName);
    if (found) {
      setCropVariety(found.variety);
      setSeason(found.season);
      setNitrogen(found.defaultN.toString());
      setPhosphorus(found.defaultP.toString());
      setPotassium(found.defaultK.toString());
      setSoilPh(found.defaultPH.toString());
      setSoilMoisture(found.defaultMoisture.toString());
    }
  }

  async function handleUseCurrentLocation() {
    setDetectingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setLatitude(lat.toFixed(4));
            setLongitude(lon.toFixed(4));

            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
              if (res.ok) {
                const geo = await res.json();
                const address = geo.address || {};
                const detectedCity = address.city || address.town || address.village || address.county || "Local Agro Zone";
                const detectedState = address.state || "State";
                const detectedCountry = address.country || "India";
                setCity(detectedCity);
                setStateName(detectedState);
                setCountry(detectedCountry);
                setLocationName(`${detectedCity}, ${detectedState}`);
                if (!farmName) {
                  setFarmName(`${detectedCity} Agro Farm`);
                }
              }
            } catch {
              setLocationName("Monitored Farm Field");
            }
            setDetectingLocation(false);
          },
          (err) => {
            console.warn("Location permission denied/unavailable:", err);
            setDetectingLocation(false);
          },
          { timeout: 8000 }
        );
      } else {
        setDetectingLocation(false);
      }
    } catch {
      setDetectingLocation(false);
    }
  }

  async function handleAnalyzeFarm(e: React.FormEvent) {
    e.preventDefault();
    if (!farmName.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your farm name." });
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const area = parseFloat(totalArea);
    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);
    const ph = parseFloat(soilPh);
    const moisture = parseFloat(soilMoisture);
    const om = parseFloat(organicMatter);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setStatusMessage({ type: "error", text: "Invalid latitude (-90 to 90 allowed)." });
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setStatusMessage({ type: "error", text: "Invalid longitude (-180 to 180 allowed)." });
      return;
    }
    if (isNaN(area) || area <= 0) {
      setStatusMessage({ type: "error", text: "Please enter a valid farm area greater than 0." });
      return;
    }
    if (isNaN(n) || n < 5 || n > 500) {
      setStatusMessage({ type: "error", text: "Nitrogen must be between 5 and 500 kg/ha." });
      return;
    }
    if (isNaN(ph) || ph < 4.0 || ph > 9.5) {
      setStatusMessage({ type: "error", text: "Soil pH must be between 4.0 and 9.5." });
      return;
    }
    if (isNaN(moisture) || moisture < 2 || moisture > 75) {
      setStatusMessage({ type: "error", text: "Soil moisture must be between 2% and 75%." });
      return;
    }

    const totalHa = areaUnit === "Acres" ? area * 0.404686 : area;

    setLoading(true);
    setStatusMessage(null);
    setAnalyzingStep(1);

    try {
      setTimeout(() => setAnalyzingStep(2), 600);
      setTimeout(() => setAnalyzingStep(3), 1200);
      setTimeout(() => setAnalyzingStep(4), 1800);
      setTimeout(() => setAnalyzingStep(5), 2400);

      const payload = {
        farm_name: farmName.trim(),
        location: locationName.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: country.trim(),
        latitude: lat,
        longitude: lon,
        total_area_hectares: roundNum(totalHa, 2),
        area_unit: areaUnit,
        crop_name: selectedCrop,
        crop_variety: cropVariety,
        season,
        planting_date: plantingDate,
        expected_harvest_date: harvestDate,
        growth_stage: growthStage,
        cultivated_area_hectares: roundNum(totalHa * 0.85, 2),
        soil_nitrogen: n,
        soil_phosphorus: p,
        soil_potassium: k,
        soil_ph: ph,
        soil_moisture: moisture,
        organic_matter: om,
        soil_type: soilType,
      };

      const result = await api.setupFarm(payload);
      setAnalysisResult(result);
      await refreshFarms();
      if (result?.farm?.id) {
        setActiveFarmId(result.farm.id);
      }
      setStatusMessage({ type: "success", text: `Farm "${result.farm.name}" successfully analyzed and registered!` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to analyze farm. Please verify values." });
    } finally {
      setLoading(false);
      setAnalyzingStep(null);
    }
  }

  async function handleRecordHarvest(e: React.FormEvent) {
    e.preventDefault();
    if (!harvestFarmId) return;

    try {
      setLoading(true);
      await api.recordHarvestResult({
        farm_id: harvestFarmId,
        crop_name: harvestCrop,
        season_year: harvestSeason,
        actual_yield: parseFloat(harvestActualYield),
        predicted_yield: parseFloat(harvestPredictedYield),
        actual_nitrogen: parseFloat(harvestActualN),
        actual_water_mm: parseFloat(harvestActualWater),
        notes: harvestNotes,
      });
      const hist = await api.getHarvestHistory(harvestFarmId);
      setHarvestHistory(hist);
      setStatusMessage({ type: "success", text: "Actual harvest feedback recorded in farm historical memory!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to record harvest results." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFarm(farmId: number) {
    if (!confirm("Are you sure you want to delete this farm holding and all telemetry records?")) return;
    try {
      await api.deleteFarm(farmId);
      await refreshFarms();
      setStatusMessage({ type: "success", text: "Farm holding removed successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete farm." });
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Farm Setup & Precision Agronomy Form</h1>
          <p className="text-xs text-slate-500">
            Personalized farm registration, GPS micro-climate enrichment, Sentinel NDVI telemetry, and Quantum Yield Analysis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab("setup"); setAnalysisResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "setup"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Add / Analyze Farm
          </button>
          <button
            onClick={() => setActiveTab("farms")}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "farms"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Holdings ({farms.length})
          </button>
          <button
            onClick={() => setActiveTab("harvest")}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "harvest"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Harvest Memory
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border shadow-xs ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* TAB 1: ADD & ANALYZE FARM FORM */}
      {activeTab === "setup" && (
        <>
          {!analysisResult ? (
            <form onSubmit={handleAnalyzeFarm} className="space-y-6">
              {/* SECTION 1: FARM LOCATION & BOUNDARIES */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">Farm Information & Location</h2>
                      <p className="text-[11px] text-slate-500">Provide GPS coordinates or use current location to synchronize live weather and satellite NDVI.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${detectingLocation ? "animate-spin" : ""}`} />
                    <span>{detectingLocation ? "Detecting GPS..." : "Use Current Location"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Farm Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Krishna Delta Precision Farm"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">District / Region Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Guntur Alluvial Basin"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">City / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. Guntur"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">State / Region</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-slate-700 font-semibold mb-1">Farm Area *</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value as any)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="Hectares">Hectares</option>
                        <option value="Acres">Acres</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GPS Latitude *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GPS Longitude *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-1.5 w-full">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Coordinates feed Copernicus Sentinel-2 satellite queries.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CROP INFORMATION */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Crop Cultivation & Seasonal Cycle</h2>
                    <p className="text-[11px] text-slate-500">Select your active crop variety, cultivation season, and growth stage.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Primary Crop *</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => handleCropChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold text-slate-800"
                    >
                      {CROPS_LIST.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.season})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Crop Variety / Hybrid</label>
                    <input
                      type="text"
                      value={cropVariety}
                      onChange={(e) => setCropVariety(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Cultivation Season</label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Rabi">Rabi (Winter - Oct to Mar)</option>
                      <option value="Kharif">Kharif (Monsoon - Jun to Nov)</option>
                      <option value="Zaid">Zaid (Summer - Mar to Jun)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Growth Stage</label>
                    <select
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      {GROWTH_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sowing / Planting Date</label>
                    <input
                      type="date"
                      value={plantingDate}
                      onChange={(e) => setPlantingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expected Harvest Date</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SOIL CONDITIONS & NUTRIENT PROFILE */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">Soil Chemistry & Moisture Telemetry</h2>
                    <p className="text-[11px] text-slate-500">Enter measured soil nutrients. Each variable feeds the Hilbert space feature map for Quantum SVR.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Available Nitrogen (N) *</label>
                      <span className="text-[10px] text-slate-400 font-mono">10 - 400 kg/ha</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="5"
                        max="500"
                        required
                        value={nitrogen}
                        onChange={(e) => setNitrogen(e.target.value)}
                        className="w-full pl-3 pr-14 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400">kg/ha</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Phosphorus (P) *</label>
                      <span className="text-[10px] text-slate-400 font-mono">5 - 150 kg/ha</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="2"
                        max="250"
                        required
                        value={phosphorus}
                        onChange={(e) => setPhosphorus(e.target.value)}
                        className="w-full pl-3 pr-14 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400">kg/ha</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Potassium (K) *</label>
                      <span className="text-[10px] text-slate-400 font-mono">10 - 400 kg/ha</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="5"
                        max="600"
                        required
                        value={potassium}
                        onChange={(e) => setPotassium(e.target.value)}
                        className="w-full pl-3 pr-14 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400">kg/ha</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Soil pH *</label>
                      <span className="text-[10px] text-slate-400 font-mono">4.5 - 9.0</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="4.0"
                      max="9.5"
                      required
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Volumetric Moisture *</label>
                      <span className="text-[10px] text-slate-400 font-mono">5% - 60%</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="2"
                        max="75"
                        required
                        value={soilMoisture}
                        onChange={(e) => setSoilMoisture(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400">%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold">Soil Classification</label>
                      <span className="text-[10px] text-slate-400 font-mono">Texture</span>
                    </div>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      {SOIL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: AUTOMATED ENRICHMENT NOTICE */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Automated Pipeline
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      No Manual Weather or NDVI Entry Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Upon clicking <strong className="text-emerald-400">Analyze My Farm</strong>, AgriQuantum automatically queries Visual Crossing for local rainfall/temperature and Copernicus Sentinel-2 for live canopy NDVI at coordinates ({latitude}, {longitude}).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-emerald-950/40 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{loading ? "Executing Pipeline..." : "Analyze My Farm"}</span>
                </button>
              </div>

              {/* PROGRESS STEPPER OVERLAY DURING SUBMISSION */}
              {loading && (
                <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-md space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
                    Executing Unified Precision Agriculture Intelligence Pipeline...
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border ${analyzingStep && analyzingStep >= 1 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                      1. Saving Farm & Soil
                    </div>
                    <div className={`p-2.5 rounded-xl border ${analyzingStep && analyzingStep >= 2 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                      2. Fetching Weather
                    </div>
                    <div className={`p-2.5 rounded-xl border ${analyzingStep && analyzingStep >= 3 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                      3. Sentinel Satellite NDVI
                    </div>
                    <div className={`p-2.5 rounded-xl border ${analyzingStep && analyzingStep >= 4 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                      4. Quantum SVR Model
                    </div>
                    <div className={`p-2.5 rounded-xl border ${analyzingStep && analyzingStep >= 5 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                      5. Risk & Optimization
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* SECTION 5: IMMEDIATE POST-SUBMISSION RESULTS VIEW */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-950 border border-emerald-700 text-emerald-400">
                      Analysis Complete
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">4-Qubit QSVR Synchronized</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {analysisResult?.farm?.name} — {analysisResult?.crop?.name}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Location: {analysisResult?.farm?.location} ({analysisResult?.farm?.latitude}, {analysisResult?.farm?.longitude}) • Area: {analysisResult?.farm?.total_area_hectares} ha
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {/* Yield Prediction */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 font-medium block">Predicted Harvest Yield</span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {analysisResult?.prediction?.predicted_yield_quintals_acre} <span className="text-xs font-semibold text-slate-500">Q/acre</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    ≈ {analysisResult?.prediction?.predicted_yield_tonnes_hectare} tonnes / hectare
                  </div>
                </div>

                {/* Weather */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 font-medium block">Live Weather Telemetry</span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {analysisResult?.weather?.temperature_c}°C
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {analysisResult?.weather?.conditions} • {analysisResult?.weather?.humidity_pct}% humidity
                  </div>
                </div>

                {/* Satellite NDVI */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 font-medium block">Copernicus Sentinel NDVI</span>
                  <div className="text-2xl font-extrabold text-emerald-800">
                    {analysisResult?.satellite?.ndvi}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Photosynthetic Canopy Index
                  </div>
                </div>

                {/* Economic Upside */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-slate-400 font-medium block">Net Economic Potential</span>
                  <div className="text-2xl font-extrabold text-emerald-800">
                    +₹{analysisResult?.economic_impact?.net_economic_upside_inr?.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    +{analysisResult?.economic_impact?.roi_improvement_pct}% optimization potential
                  </div>
                </div>
              </div>

              {/* Recommendations & Risk Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-700" />
                    Precision Agronomy Recommendations
                  </h3>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    {analysisResult?.recommendations?.advisory_summary}
                  </p>
                  <div className="space-y-1.5 text-slate-600 text-[11px]">
                    <div>• <strong>Nitrogen Strategy:</strong> {analysisResult?.recommendations?.nitrogen_advisory}</div>
                    <div>• <strong>Irrigation Schedule:</strong> {analysisResult?.recommendations?.irrigation_advisory}</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    5-Factor Agricultural Risk Radar
                  </h3>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Overall Agronomic Risk Tier</div>
                      <div className="text-[11px] text-slate-500">Computed from live weather & soil metrics</div>
                    </div>
                    <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {analysisResult?.risk_outlook?.overall_risk_level || "Low Risk"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>• <strong>Water Stress Index:</strong> {analysisResult?.risk_outlook?.factors?.water_stress?.tier || "Low"}</div>
                    <div>• <strong>Nutrient Balance:</strong> {analysisResult?.risk_outlook?.factors?.nutrient_imbalance?.tier || "Optimal"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY FARM HOLDINGS */}
      {activeTab === "farms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Registered Farm Holdings ({farms.length})</h2>
            <button
              onClick={() => { setActiveTab("setup"); setAnalysisResult(null); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Farm
            </button>
          </div>

          {farms.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Let's set up your farm</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Enter your farm information to begin personalized agricultural analysis and real-time satellite telemetry.
              </p>
              <button
                onClick={() => { setActiveTab("setup"); setAnalysisResult(null); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add My Farm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farms.map((f) => {
                const isActive = activeFarmId === f.id;
                return (
                  <div
                    key={f.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-sm space-y-3 ${
                      isActive ? "border-emerald-700 ring-2 ring-emerald-700/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active Farm
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {f.location || `${f.state}, ${f.country}`}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteFarm(f.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete farm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Coordinates:</span>
                        <span className="font-mono font-medium text-slate-700">{f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Total Area:</span>
                        <span className="font-semibold text-slate-800">{f.total_area_hectares} Hectares</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Added: {new Date(f.created_at).toLocaleDateString()}
                      </span>
                      {!isActive ? (
                        <button
                          onClick={() => setActiveFarmId(f.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold text-xs transition cursor-pointer"
                        >
                          Select Farm
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push("/dashboard")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                        >
                          Open Dashboard <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HARVEST FEEDBACK & ACCURACY MEMORY */}
      {activeTab === "harvest" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Record Actual Harvest Feedback</h2>
              <p className="text-xs text-slate-500">
                Log actual harvest results to calculate model error rates and improve future quantum predictions.
              </p>
            </div>

            <form onSubmit={handleRecordHarvest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Farm</label>
                  <select
                    value={harvestFarmId || ""}
                    onChange={(e) => setHarvestFarmId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Crop Harvested</label>
                  <input
                    type="text"
                    value={harvestCrop}
                    onChange={(e) => setHarvestCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Season & Year</label>
                  <input
                    type="text"
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Actual Recorded Yield (Q/Acre) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={harvestActualYield}
                    onChange={(e) => setHarvestActualYield(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Predicted Yield (Q/Acre)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestPredictedYield}
                    onChange={(e) => setHarvestPredictedYield(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Actual Applied Nitrogen (kg/ha)</label>
                  <input
                    type="number"
                    step="1"
                    value={harvestActualN}
                    onChange={(e) => setHarvestActualN(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agronomic Notes & Observations</label>
                <textarea
                  rows={2}
                  value={harvestNotes}
                  onChange={(e) => setHarvestNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  Save Harvest Verification
                </button>
              </div>
            </form>
          </div>

          {/* Historical Records Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Harvest Verification Memory</h3>
            {harvestHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No actual harvest feedback recorded yet for this farm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-2 font-semibold">Season</th>
                      <th className="pb-2 font-semibold">Crop</th>
                      <th className="pb-2 font-semibold">Actual Yield</th>
                      <th className="pb-2 font-semibold">Predicted Yield</th>
                      <th className="pb-2 font-semibold">Accuracy Error</th>
                      <th className="pb-2 font-semibold">Recorded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {harvestHistory.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 font-medium text-slate-800">{h.season_year}</td>
                        <td className="py-2.5 text-slate-600">{h.crop_name}</td>
                        <td className="py-2.5 font-bold text-slate-900">{h.actual_yield} Q/acre</td>
                        <td className="py-2.5 text-slate-600">{h.predicted_yield} Q/acre</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                            {h.error_pct}% error
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 font-mono text-[11px]">{new Date(h.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function roundNum(num: number, dec = 2): number {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}
