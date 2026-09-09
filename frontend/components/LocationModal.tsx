"use client";

import React, { useState } from "react";
import { MapPin, Navigation, X, Check, Globe, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { resolvePincode } from "@/lib/regionalAgroData";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  { city: "Visakhapatnam", region: "Andhra Pradesh", lat: 17.6868, lon: 83.2185 },
  { city: "Guntur", region: "Andhra Pradesh", lat: 16.3067, lon: 80.4365 },
  { city: "Vijayawada", region: "Andhra Pradesh", lat: 16.5062, lon: 80.6480 },
  { city: "Ludhiana", region: "Punjab", lat: 30.9010, lon: 75.8573 },
  { city: "Karnal", region: "Haryana", lat: 29.6857, lon: 76.9905 },
  { city: "Pune", region: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { city: "Nashik", region: "Maharashtra", lat: 19.9975, lon: 73.7898 },
];

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { location, locationLoading, requestLocationPermission, setManualLocation } = useAuth();
  const [modalPincode, setModalPincode] = useState("");
  const [resolvingModalPin, setResolvingModalPin] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState("");
  const [manualRegion, setManualRegion] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModalPincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setModalPincode(cleaned);
    setPincodeSuccess(null);
    if (cleaned.length >= 2) {
      setResolvingModalPin(true);
      try {
        const res = await resolvePincode(cleaned);
        if (res) {
          setPincodeSuccess(`${res.place || res.city}, ${res.district} (${res.state})`);
          if (cleaned.length === 6) {
            setManualLocation(res.city, res.state, res.latitude, res.longitude);
            setTimeout(() => {
              onClose();
            }, 500);
          }
        }
      } catch (err) {
        console.warn("Modal pin error:", err);
      } finally {
        setResolvingModalPin(false);
      }
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocError(null);
    const success = await requestLocationPermission();
    if (success) {
      onClose();
    } else {
      setLocError("Location access was denied or timed out. Please select your region below or enter coordinates manually.");
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_LOCATIONS[0]) => {
    setManualLocation(preset.city, preset.region, preset.lat, preset.lon);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) {
      setLocError("Please provide valid decimal coordinates (e.g. 17.68, 83.21).");
      return;
    }
    setManualLocation(manualCity || "Custom Farm", manualRegion || "Region", lat, lon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Location Settings</h3>
              <p className="text-xs text-slate-500">Personalize weather, maps, and field telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Farm Region
          </span>
          <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{location.formattedAddress}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E • {location.isDetected ? "Detected via GPS" : "Pre-configured Region"}
          </div>
        </div>

        {locError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{locError}</span>
          </div>
        )}

        {/* Action 1: Use Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {locationLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Detecting coordinates & address...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Detect My Current Location (GPS)</span>
            </>
          )}
        </button>

        {/* Action 1.5: Postal PIN Code Quick Finder */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span>Enter Postal PIN Code</span>
              {resolvingModalPin && <RefreshCw className="w-3 h-3 text-emerald-700 animate-spin" />}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Instant Location & Soil</span>
          </div>
          <input
            type="text"
            maxLength={6}
            placeholder="Type 6-digit PIN code (e.g. 522001, 141001, 411001)"
            value={modalPincode}
            onChange={(e) => handleModalPincodeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
          />
          {pincodeSuccess && (
            <div className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5 pt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">Auto-detected: {pincodeSuccess}</span>
            </div>
          )}
        </div>

        {/* Action 2: Quick Presets */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Or Select an Agricultural Region:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {PRESET_LOCATIONS.map((p) => {
              const isSelected = location.city === p.city;
              return (
                <button
                  key={p.city}
                  onClick={() => handlePresetSelect(p)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{p.city}</span>
                    <span className="text-[10px] text-slate-400 font-normal block truncate">{p.region}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action 3: Manual Coordinate Form Toggle */}
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showManualForm ? "Hide Manual Coordinates" : "Enter Coordinates Manually"}</span>
          </button>

          {showManualForm && (
            <form onSubmit={handleManualSubmit} className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">City / Village</label>
                  <input
                    type="text"
                    placeholder="e.g. Visakhapatnam"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">State / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Andhra Pradesh"
                    value={manualRegion}
                    onChange={(e) => setManualRegion(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="17.6868"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="83.2185"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-emerald-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Apply Coordinates
              </button>
            </form>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Your location data is stored securely on your device and used solely to personalize localized meteorological forecasts and field boundaries.
        </p>
      </div>
    </div>
  );
}
