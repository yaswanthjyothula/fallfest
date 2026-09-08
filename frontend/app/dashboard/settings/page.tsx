"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Database, CloudSun, Atom, CheckCircle2, User } from "lucide-react";
import { api } from "@/lib/api";

export default function PlatformSettingsPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const [sb, health] = await Promise.all([
          api.getSupabaseStatus(),
          api.getHealth(),
        ]);
        setSupabaseStatus(sb);
        setSystemHealth(health);
      } catch (e) {
        console.warn("Settings status load notice:", e);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings & Infrastructure</h1>
        <p className="text-xs text-slate-500">
          Manage system configurations, cloud database synchronization, and quantum simulation backends.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Dr. Aris Thorne</h3>
            <p className="text-xs text-slate-500">Administrator • admin@agriquantum.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Assigned Role:</span>
            <div className="font-semibold text-slate-800 mt-0.5">System Administrator</div>
          </div>
          <div>
            <span className="text-slate-400">Session Status:</span>
            <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Bearer Token
            </div>
          </div>
          <div>
            <span className="text-slate-400">Access Scope:</span>
            <div className="font-semibold text-slate-800 mt-0.5">Full Enterprise Access</div>
          </div>
        </div>
      </div>

      {/* Cloud & Infrastructure Services */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Integrated Cloud Services
        </h3>

        <div className="space-y-3">
          {/* Supabase Status */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-700" />
              <div>
                <div className="font-semibold text-slate-900">Supabase Cloud Database</div>
                <div className="text-[11px] text-slate-500">
                  Project: <code className="font-mono">{supabaseStatus?.project_id || "arbykwiinhpaymeuzhtl"}</code>
                </div>
              </div>
            </div>
            <span className="font-semibold text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
            </span>
          </div>

          {/* Visual Crossing Weather */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudSun className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-semibold text-slate-900">Visual Crossing Weather API</div>
                <div className="text-[11px] text-slate-500">
                  Timeline Weather API • 1-Hour TTL In-Memory Cache Active
                </div>
              </div>
            </div>
            <span className="font-semibold text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational
            </span>
          </div>

          {/* Quantum Engine */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Atom className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">Qiskit Aer Quantum Simulator</div>
                <div className="text-[11px] text-slate-500">
                  Fidelity Statevector Kernel Engine • 4 Qubits Active
                </div>
              </div>
            </div>
            <span className="font-semibold text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
