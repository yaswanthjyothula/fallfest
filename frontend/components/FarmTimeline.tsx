"use client";

import React, { useState, useEffect } from "react";
import {
  Satellite,
  CloudRain,
  Sparkles,
  TrendingUp,
  UserCheck,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

export interface TimelineEvent {
  id: number;
  farm_id?: number;
  event_type?: string;
  category?: string;
  title: string;
  description: string;
  severity?: string;
  impact_level?: string;
  timestamp?: string;
  event_date?: string;
  metric_value?: string;
}

interface FarmTimelineProps {
  farmId: number;
}

export function FarmTimeline({ farmId }: FarmTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/farms/${farmId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      }
    } catch (e) {
      console.warn("Could not fetch farm timeline", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [farmId]);

  const getCategoryIcon = (type?: string, cat?: string) => {
    const key = (type || cat || "").toLowerCase();
    if (key.includes("satellite")) {
      return <Satellite className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (key.includes("weather")) {
      return <CloudRain className="w-3.5 h-3.5 text-sky-600" />;
    }
    if (key.includes("prediction")) {
      return <Sparkles className="w-3.5 h-3.5 text-emerald-700" />;
    }
    if (key.includes("recommendation")) {
      return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (key.includes("management")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
    }
    return <UserCheck className="w-3.5 h-3.5 text-slate-600" />;
  };

  const getImpactBadge = (sev?: string, impact?: string) => {
    const level = (sev || impact || "low").toLowerCase();
    switch (level) {
      case "high":
      case "warning":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "moderate":
      case "info":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (isoOrDate?: string) => {
    if (!isoOrDate) return "Recent";
    try {
      const d = new Date(isoOrDate);
      if (isNaN(d.getTime())) return isoOrDate;
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoOrDate;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Farm Decision & Event Timeline
          </h3>
        </div>
        <button
          onClick={fetchTimeline}
          disabled={loading}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh timeline"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading farm event chronicle...
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No recorded agronomic events for this season yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((evt) => {
            const rawType = evt.event_type || evt.category || "Event";
            const badgeLevel = evt.severity || evt.impact_level || "low";
            const dateStr = formatDate(evt.timestamp || evt.event_date);

            return (
              <div key={evt.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center">
                  {getCategoryIcon(evt.event_type, evt.category)}
                </div>

                {/* Event Content */}
                <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 group-hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-900">
                      {evt.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dateStr}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getImpactBadge(
                          evt.severity,
                          evt.impact_level
                        )}`}
                      >
                        {badgeLevel}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {evt.description}
                  </p>
                  {evt.metric_value && (
                    <div className="mt-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded inline-block">
                      {evt.metric_value}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
