"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { api, Farm, Field, Crop } from "@/lib/api";

export default function FarmManagementPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Farm Form State
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("");
  const [newFarmLat, setNewFarmLat] = useState("30.9010");
  const [newFarmLon, setNewFarmLon] = useState("75.8573");
  const [newFarmArea, setNewFarmArea] = useState("120.0");

  // New Field Form State
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldArea, setNewFieldArea] = useState("45.0");
  const [newFieldSoil, setNewFieldSoil] = useState("Alluvial Loam");

  // New Crop Form State
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [targetFieldId, setTargetFieldId] = useState<number | null>(null);
  const [newCropName, setNewCropName] = useState("Winter Wheat");
  const [newCropVariety, setNewCropVariety] = useState("PBW-343");
  const [newCropSeason, setNewCropSeason] = useState("Rabi 2026");

  async function refreshData() {
    try {
      setLoading(true);
      const farmList = await api.getFarms();
      setFarms(farmList);
      if (farmList.length > 0) {
        const active = selectedFarm
          ? farmList.find((f) => f.id === selectedFarm.id) || farmList[0]
          : farmList[0];
        setSelectedFarm(active);

        const fieldList = await api.getFields(active.id);
        setFields(fieldList);

        const cropList = await api.getCrops();
        setCrops(cropList);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load farm data." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function handleSelectFarm(farm: Farm) {
    setSelectedFarm(farm);
    try {
      const fieldList = await api.getFields(farm.id);
      setFields(fieldList);
    } catch (e: any) {
      console.warn("Failed to load fields for farm:", e);
    }
  }

  async function handleCreateFarm(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await api.createFarm({
        name: newFarmName,
        location: newFarmLocation,
        latitude: parseFloat(newFarmLat),
        longitude: parseFloat(newFarmLon),
        total_area_hectares: parseFloat(newFarmArea),
        country: "India",
      });
      setStatusMessage({ type: "success", text: `Farm "${created.name}" created successfully!` });
      setShowAddFarm(false);
      setNewFarmName("");
      setNewFarmLocation("");
      await refreshData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create farm." });
    }
  }

  async function handleDeleteFarm(id: number) {
    if (!confirm("Are you sure you want to delete this farm and all associated fields?")) return;
    try {
      await api.deleteFarm(id);
      setStatusMessage({ type: "success", text: "Farm deleted successfully." });
      await refreshData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete farm." });
    }
  }

  async function handleCreateField(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      const created = await api.createField(selectedFarm.id, {
        name: newFieldName,
        area_hectares: parseFloat(newFieldArea),
        soil_type: newFieldSoil,
      });
      setStatusMessage({ type: "success", text: `Plot "${created.name}" added to ${selectedFarm.name}.` });
      setShowAddField(false);
      setNewFieldName("");
      const fieldList = await api.getFields(selectedFarm.id);
      setFields(fieldList);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to add field." });
    }
  }

  async function handleDeleteField(id: number) {
    if (!confirm("Delete this field?")) return;
    try {
      await api.deleteField(id);
      setStatusMessage({ type: "success", text: "Field deleted successfully." });
      if (selectedFarm) {
        const fieldList = await api.getFields(selectedFarm.id);
        setFields(fieldList);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete field." });
    }
  }

  async function handleAddCrop(e: React.FormEvent) {
    e.preventDefault();
    if (!targetFieldId) return;
    try {
      const created = await api.addCrop(targetFieldId, {
        name: newCropName,
        variety: newCropVariety,
        season: newCropSeason,
        growth_stage: "Stem Elongation",
      });
      setStatusMessage({ type: "success", text: `Crop cycle ${created.name} assigned!` });
      setShowAddCrop(false);
      const cropList = await api.getCrops();
      setCrops(cropList);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to assign crop." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Farm & Field Management</h1>
          <p className="text-xs text-slate-500">
            Configure agricultural stations, geographic boundaries, plot soils, and active crop cycles.
          </p>
        </div>
        <button
          onClick={() => setShowAddFarm(!showAddFarm)}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Farm</span>
        </button>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Create Farm Modal/Drawer */}
      {showAddFarm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Register New Agricultural Station</h3>
            <button onClick={() => setShowAddFarm(false)} className="text-slate-400 hover:text-slate-600 text-xs">
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateFarm} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Station Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Punjab Agronomic Center"
                value={newFarmName}
                onChange={(e) => setNewFarmName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Location / Agro-Ecological Zone</label>
              <input
                type="text"
                required
                placeholder="e.g., Ludhiana Alluvial Basin"
                value={newFarmLocation}
                onChange={(e) => setNewFarmLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Total Area (Hectares)</label>
              <input
                type="number"
                step="0.1"
                required
                value={newFarmArea}
                onChange={(e) => setNewFarmArea(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Latitude (decimal)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={newFarmLat}
                onChange={(e) => setNewFarmLat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Longitude (decimal)</label>
              <input
                type="number"
                step="0.0001"
                required
                value={newFarmLon}
                onChange={(e) => setNewFarmLon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Save Agricultural Holding
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Farm Selection & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Farms List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-900">Holdings Directory ({farms.length})</span>
          </div>

          <div className="space-y-2">
            {farms.map((farm) => {
              const isSelected = selectedFarm?.id === farm.id;
              return (
                <div
                  key={farm.id}
                  onClick={() => handleSelectFarm(farm)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 text-xs group-hover:text-emerald-800 flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                      <span>{farm.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{farm.total_area_hectares} ha</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-600">
                        {farm.latitude.toFixed(2)}°N, {farm.longitude.toFixed(2)}°E
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFarm(farm.id);
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-600 rounded-md transition-colors"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Farm Plots and Crops */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFarm ? (
            <>
              {/* Active Farm Header Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                      Selected Station
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedFarm.name}</h2>
                    <p className="text-xs text-slate-500">{selectedFarm.location}, {selectedFarm.country}</p>
                  </div>
                  <button
                    onClick={() => setShowAddField(!showAddField)}
                    className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Plot Field</span>
                  </button>
                </div>

                {/* Add Field Form */}
                {showAddField && (
                  <form onSubmit={handleCreateField} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="font-semibold text-slate-800">Add Field to {selectedFarm.name}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Plot Name (e.g. Plot 103)"
                        required
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Area in Hectares"
                        required
                        value={newFieldArea}
                        onChange={(e) => setNewFieldArea(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Soil Type"
                        value={newFieldSoil}
                        onChange={(e) => setNewFieldSoil(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddField(false)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-3 py-1 bg-emerald-700 text-white font-semibold rounded-lg">
                        Add Plot
                      </button>
                    </div>
                  </form>
                )}

                {/* Fields Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Monitored Plots ({fields.length})
                  </h4>
                  {fields.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                      No fields registered yet. Click &quot;Add Plot Field&quot; above to add fields.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fields.map((f) => (
                        <div key={f.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{f.name}</span>
                            <button
                              onClick={() => handleDeleteField(f.id)}
                              className="text-slate-300 hover:text-red-600"
                              title="Delete Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div>Area: <span className="font-semibold text-slate-700">{f.area_hectares} ha</span></div>
                            <div>Soil: <span className="text-slate-700">{f.soil_type}</span></div>
                          </div>
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setTargetFieldId(f.id);
                                setShowAddCrop(true);
                              }}
                              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                            >
                              <Sprout className="w-3 h-3" />
                              <span>Assign Crop</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Crop Cycle Modal */}
              {showAddCrop && targetFieldId && (
                <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Assign Crop Cycle to Field #{targetFieldId}</span>
                    <button onClick={() => setShowAddCrop(false)} className="text-slate-400">✕</button>
                  </div>
                  <form onSubmit={handleAddCrop} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Crop (e.g. Winter Wheat)"
                      required
                      value={newCropName}
                      onChange={(e) => setNewCropName(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Variety (e.g. PBW-343)"
                      value={newCropVariety}
                      onChange={(e) => setNewCropVariety(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Season (e.g. Rabi 2026)"
                      value={newCropSeason}
                      onChange={(e) => setNewCropSeason(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <button type="submit" className="sm:col-span-3 bg-emerald-700 text-white font-semibold py-1.5 rounded-lg">
                      Save Crop Cycle
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-400">
              Select or register a farm to view plot fields and manage crop cycles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
