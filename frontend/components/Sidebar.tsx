"use client";

import React, { useEffect } from "react";
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
  Database,
  FileCheck2,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Yield Prediction", href: "/dashboard/predict", icon: Sparkles },
  { name: "Farm Analysis", href: "/dashboard/farms", icon: MapPin },
  { name: "Recommendations", href: "/dashboard/recommendations", icon: TrendingUp },
  { name: "Quantum Analysis", href: "/dashboard/quantum", icon: Atom },
  { name: "Model Comparison", href: "/dashboard/benchmarks", icon: BarChart3 },
  { name: "Crop Health", href: "/dashboard/crop-health", icon: Leaf },
  { name: "Agricultural Data", href: "/dashboard/data", icon: Database },
  { name: "Reports", href: "/dashboard/reports", icon: FileCheck2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help and Support", href: "/dashboard/help", icon: HelpCircle },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on path change
  useEffect(() => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  }, [pathname]);

  const navContent = (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-xs">
            Q
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base">
              Agri<span className="text-emerald-700">Quantum</span>
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links - Subtle vertical indicator, no bulky rectangular boxes */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform
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
              className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all group ${
                isActive
                  ? "text-emerald-800 font-semibold border-l-2 border-emerald-700 bg-emerald-50/40 rounded-r-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-medium">
          <span>Simulation Engine</span>
          <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            4-Qubit Aer
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>Precision Agriculture</span>
          <span className="font-mono">v2.5.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200/80 flex-col h-screen sticky top-0 select-none z-30 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
