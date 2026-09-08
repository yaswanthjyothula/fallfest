"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Filter,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AgriculturalDataExplorerPage() {
  const [dataPreview, setDataPreview] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [cropFilter, setCropFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Check options: multi-row selection state
  const [selectedPlotIds, setSelectedPlotIds] = useState<number[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getDataPreview(page, pageSize, cropFilter || undefined);
      setDataPreview(res);
      setSelectedPlotIds([]); // Reset selection on page or filter change
    } catch (err) {
      console.warn("Failed to load dataset preview:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, cropFilter]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    try {
      const res = await api.uploadCSV(file);
      setUploadResult({ success: true, data: res });
      await loadData();
    } catch (err: any) {
      setUploadResult({ success: false, error: err.message || "Failed to upload CSV file." });
    } finally {
      setUploading(false);
    }
  }

  // Row selection toggle handlers
  function toggleSelectAll() {
    const records = dataPreview?.records || [];
    if (selectedPlotIds.length === records.length && records.length > 0) {
      setSelectedPlotIds([]);
    } else {
      setSelectedPlotIds(records.map((r: any) => r.record_id));
    }
  }

  function toggleSelectRow(id: number) {
    if (selectedPlotIds.includes(id)) {
      setSelectedPlotIds(selectedPlotIds.filter((pId) => pId !== id));
    } else {
      setSelectedPlotIds([...selectedPlotIds, id]);
    }
  }

  function exportSelectedCSV() {
    const records = dataPreview?.records || [];
    const selected = records.filter((r: any) => selectedPlotIds.includes(r.record_id));
    if (selected.length === 0) return;

    const headers = ["Plot_ID", "Crop", "Nitrogen_kg_ha", "Phosphorus_kg_ha", "Potassium_kg_ha", "Moisture_pct", "Rainfall_mm", "NDVI", "Actual_Yield_Q_Acre"];
    const rows = selected.map((r: any) => [
      `PLT-${r.record_id}`,
      `"${r.crop}"`,
      r.soil_nitrogen_kg_ha,
      r.soil_phosphorus_kg_ha,
      r.soil_potassium_kg_ha,
      r.soil_moisture_pct,
      r.rainfall_mm,
      r.ndvi,
      r.actual_yield_q_acre,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agriquantum_selected_plots_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const allSelected = (dataPreview?.records?.length || 0) > 0 && selectedPlotIds.length === (dataPreview?.records?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Farm Data
        </h2>
        <p className="text-xs text-slate-500">
          Inspect validated multi-parameter field records, verify nutrient distributions, and ingest agronomic CSV datasets.
        </p>
      </div>

      {/* CSV Upload & Ingestion Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Batch Agricultural CSV Upload</h3>
          </div>
          <span className="text-[11px] text-slate-400">Enforces physical bounds for N, moisture, rain & NDVI</span>
        </div>

        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl p-6 text-center space-y-2 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-xs text-slate-700 font-semibold">
            Select an agricultural CSV dataset to upload and validate
          </div>
          <p className="text-[11px] text-slate-400">
            Expected headers: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">nitrogen, moisture, rainfall, ndvi, crop</code>
          </p>
          <label className="inline-block mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-sm">
            {uploading ? "Ingesting & Validating..." : "Choose CSV File"}
            <input
              type="file"
              accept=".csv"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {uploadResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              uploadResult.success ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {uploadResult.success ? (
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dataset Ingested: {uploadResult.data.filename} ({uploadResult.data.valid_rows} valid records)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Validation Error: {uploadResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginated Dataset Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Monitored Agronomic Observations</h3>
            <p className="text-xs text-slate-500">
              Showing page {dataPreview?.page || 1} of {dataPreview?.total_pages || 1} ({dataPreview?.total_records || 0} total records)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Crop Filter Dropdown Options */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={cropFilter}
                onChange={(e) => {
                  setCropFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                aria-label="Filter records by crop"
              >
                <option value="">All Cultivars</option>
                <option value="Winter Wheat">Winter Wheat</option>
                <option value="Hybrid Maize">Hybrid Maize</option>
                <option value="Basmati Rice">Basmati Rice</option>
                <option value="Soybean">Soybean</option>
              </select>
            </div>

            {/* Instant Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search plot..."
                value={cropFilter}
                onChange={(e) => {
                  setCropFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Batch Action Toolbar when rows are checked */}
        {selectedPlotIds.length > 0 && (
          <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>{selectedPlotIds.length} observation plot{selectedPlotIds.length > 1 ? "s" : ""} selected</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={exportSelectedCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected CSV</span>
              </button>
              <button
                onClick={() => setSelectedPlotIds([])}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 accent-emerald-700 cursor-pointer"
                    aria-label="Select all plots"
                  />
                </th>
                <th className="py-3 px-4">Plot ID</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Nitrogen (kg/ha)</th>
                <th className="py-3 px-4">Phosphorus</th>
                <th className="py-3 px-4">Potassium</th>
                <th className="py-3 px-4">Moisture</th>
                <th className="py-3 px-4">Rainfall</th>
                <th className="py-3 px-4">NDVI</th>
                <th className="py-3 px-4">Actual Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPreview?.records?.map((r: any) => {
                const isSelected = selectedPlotIds.includes(r.record_id);
                return (
                  <tr
                    key={r.record_id}
                    className={`transition-colors ${
                      isSelected ? "bg-emerald-50/50" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(r.record_id)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 accent-emerald-700 cursor-pointer"
                        aria-label={`Select plot ${r.record_id}`}
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">PLT-{r.record_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{r.crop}</td>
                    <td className="py-3 px-4 font-mono">{r.soil_nitrogen_kg_ha}</td>
                    <td className="py-3 px-4 font-mono">{r.soil_phosphorus_kg_ha}</td>
                    <td className="py-3 px-4 font-mono">{r.soil_potassium_kg_ha}</td>
                    <td className="py-3 px-4 font-mono">{r.soil_moisture_pct}%</td>
                    <td className="py-3 px-4 font-mono">{r.rainfall_mm} mm</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{r.ndvi}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.actual_yield_q_acre} Q/ac</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-slate-400 font-mono text-[11px]">
            Page {dataPreview?.page || 1} of {dataPreview?.total_pages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(dataPreview?.total_pages || 1, p + 1))}
            disabled={page >= (dataPreview?.total_pages || 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
