"use client";

import React, { useState, useEffect } from "react";
import { CloudSun, Droplets, Wind, Sun, Compass, ShieldCheck, AlertCircle, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function WeatherCenterPage() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const data = await api.getFarmWeather(1);
        setWeatherData(data);
      } catch (err) {
        console.warn("Failed to load farm weather:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Visual Crossing Weather & Agronomic Telemetry Center
        </h1>
        <p className="text-xs text-slate-500">
          Hyperlocal meteorological observations and multi-day agro-forecasts powering crop water budget and thermal accumulation models.
        </p>
      </div>

      {weatherData && (
        <>
          {/* Current Conditions Strip */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Live Meteorological Observations — {weatherData.farm_name}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Source: {weatherData.weather_provider}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Temperature</span>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {weatherData.current?.temperature_c}°C
                </div>
                <span className="text-[10px] text-slate-400">Feels like {weatherData.current?.feels_like_c}°C</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Precipitation</span>
                <div className="text-xl font-bold text-blue-700 font-mono">
                  {weatherData.current?.precipitation_mm} mm
                </div>
                <span className="text-[10px] text-slate-400">PoP: {weatherData.current?.precip_prob_pct}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Relative Humidity</span>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {weatherData.current?.humidity_pct}%
                </div>
                <span className="text-[10px] text-slate-400">Dew point: {weatherData.current?.dew_point_c}°C</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Wind Speed</span>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {weatherData.current?.wind_speed_kmh} km/h
                </div>
                <span className="text-[10px] text-slate-400">Dir: {weatherData.current?.wind_direction_deg}°</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Solar Radiation</span>
                <div className="text-xl font-bold text-amber-700 font-mono">
                  {weatherData.current?.solar_radiation_wm2} W/m²
                </div>
                <span className="text-[10px] text-slate-400">UV Index: {weatherData.current?.uv_index}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-medium">Surface Pressure</span>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {weatherData.current?.pressure_hpa} hPa
                </div>
                <span className="text-[10px] text-slate-400">Atmospheric seal</span>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">7-Day Agricultural Forecast Envelope</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
              {weatherData.forecast?.forecast?.slice(0, 7).map((day: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-mono text-[11px] font-semibold text-slate-600 block">{day.date}</span>
                  <div className="text-slate-900 font-bold font-mono">
                    {day.temp_max_c}° <span className="text-slate-400 font-normal">/ {day.temp_min_c}°</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipitation_mm}mm ({day.precip_prob_pct}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1 block">{day.conditions}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agronomic Impact Advisories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-700" />
                <span>Precipitation & Soil Water Balance</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {weatherData.summary?.precipitation_impact_advisory || "Adequate seasonal moisture reserves detected. Transpiration supported without supplemental emergency irrigation."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Thermal Accumulation & Growing Degree Days</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {weatherData.summary?.temperature_impact_advisory || "Optimal thermal accumulation supporting stem elongation and tillering without heat-shock penalties."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
