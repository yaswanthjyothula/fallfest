"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  MapPin,
  TrendingUp,
  Atom,
  BarChart3,
  Leaf,
  CloudSun,
  Database,
  FileCheck2,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Yield Prediction", href: "/dashboard/predict", icon: Sparkles, tag: "QSVR" },
  { name: "Farm Management", href: "/dashboard/farms", icon: MapPin },
  { name: "Recommendations", href: "/dashboard/recommendations", icon: TrendingUp },
  { name: "Quantum Analysis", href: "/dashboard/quantum", icon: Atom, tag: "4-Qubit" },
  { name: "Model Benchmarks", href: "/dashboard/benchmarks", icon: BarChart3 },
  { name: "Crop Health", href: "/dashboard/crop-health", icon: Leaf, tag: "NDVI" },
  { name: "Weather Center", href: "/dashboard/weather", icon: CloudSun },
  { name: "Agricultural Data", href: "/dashboard/data", icon: Database },
  { name: "Certified Reports", href: "/dashboard/reports", icon: FileCheck2 },
  { name: "Platform Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm ring-4 ring-emerald-50">
          <Atom className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 tracking-tight text-lg">
              Agri<span className="text-emerald-700">Quantum</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Precision Agronomy & QML</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspaces
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-emerald-50/80 text-emerald-800 font-semibold border border-emerald-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.tag && (
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-emerald-200/70 text-emerald-900"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/60"
                  }`}
                >
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Infrastructure Telemetry Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Quantum Engine</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Aer-4Q
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Cloud Database</span>
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              Supabase
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Weather API</span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50/70 px-1.5 py-0.5 rounded">
              Visual Crossing
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Production Node
          </span>
          <span className="font-mono text-[10px]">v2.5.0</span>
        </div>
      </div>
    </aside>
  );
}
