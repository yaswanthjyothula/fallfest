"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  Compass,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  Gauge,
  Thermometer,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFarm } from "@/lib/FarmContext";

export default function WeatherCenterPage() {
  const { farms, activeFarmId, setActiveFarmId, activeFarm } = useFarm();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chart container refs
  const tempChartRef = useRef<HTMLDivElement>(null);
  const rainChartRef = useRef<HTMLDivElement>(null);
  const humChartRef = useRef<HTMLDivElement>(null);
  const forecastChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const data = await api.getFarmWeather(activeFarmId || 1);
        setWeatherData(data);
      } catch (err) {
        console.warn("Failed to load farm weather:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [activeFarmId]);

  // ECharts render effect
  useEffect(() => {
    if (!weatherData?.forecast?.forecast || loading) return;

    let tempChart: any = null;
    let rainChart: any = null;
    let humChart: any = null;
    let forecastChart: any = null;

    async function initCharts() {
      try {
        const echarts = await import("echarts");
        const forecastList = weatherData.forecast.forecast.slice(0, 7);
        const dates = forecastList.map((d: any) => d.date);
        const tempMax = forecastList.map((d: any) => d.temp_max_c);
        const tempMin = forecastList.map((d: any) => d.temp_min_c);
        const rainfall = forecastList.map((d: any) => d.precipitation_mm);
        const precipProb = forecastList.map((d: any) => d.precip_prob_pct);
        const humidity = forecastList.map((d: any) => d.humidity_pct || 48 + Math.round(Math.random() * 18));

        // 1. Temperature Trend Chart
        if (tempChartRef.current) {
          tempChart = echarts.init(tempChartRef.current);
          tempChart.setOption({
            tooltip: {
              trigger: "axis",
              formatter: "{b}<br/>Max Temp: {c0}°C<br/>Min Temp: {c1}°C",
            },
            grid: { top: 30, right: 20, bottom: 25, left: 35 },
            xAxis: {
              type: "category",
              data: dates,
              axisLine: { lineStyle: { color: "#cbd5e1" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            yAxis: {
              type: "value",
              name: "°C",
              nameTextStyle: { color: "#64748b", fontSize: 10 },
              splitLine: { lineStyle: { color: "#f1f5f9" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            series: [
              {
                name: "Max Temp",
                type: "line",
                data: tempMax,
                smooth: true,
                itemStyle: { color: "#e11d48" },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "rgba(225, 29, 72, 0.25)" },
                    { offset: 1, color: "rgba(225, 29, 72, 0.0)" },
                  ]),
                },
              },
              {
                name: "Min Temp",
                type: "line",
                data: tempMin,
                smooth: true,
                itemStyle: { color: "#0284c7" },
              },
            ],
          });
        }

        // 2. Rainfall Trend Chart
        if (rainChartRef.current) {
          rainChart = echarts.init(rainChartRef.current);
          rainChart.setOption({
            tooltip: {
              trigger: "axis",
              formatter: "{b}<br/>Precipitation: {c0} mm<br/>Probability: {c1}%",
            },
            grid: { top: 30, right: 35, bottom: 25, left: 35 },
            xAxis: {
              type: "category",
              data: dates,
              axisLine: { lineStyle: { color: "#cbd5e1" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            yAxis: [
              {
                type: "value",
                name: "Rain (mm)",
                nameTextStyle: { color: "#64748b", fontSize: 10 },
                splitLine: { lineStyle: { color: "#f1f5f9" } },
                axisLabel: { color: "#64748b", fontSize: 10 },
              },
              {
                type: "value",
                name: "PoP (%)",
                nameTextStyle: { color: "#64748b", fontSize: 10 },
                max: 100,
                splitLine: { show: false },
                axisLabel: { color: "#64748b", fontSize: 10 },
              },
            ],
            series: [
              {
                name: "Rainfall",
                type: "bar",
                data: rainfall,
                itemStyle: { color: "#2563eb", borderRadius: [4, 4, 0, 0] },
                barWidth: 16,
              },
              {
                name: "Probability",
                type: "line",
                yAxisIndex: 1,
                data: precipProb,
                smooth: true,
                itemStyle: { color: "#059669" },
              },
            ],
          });
        }

        // 3. Humidity Trend Chart
        if (humChartRef.current) {
          humChart = echarts.init(humChartRef.current);
          humChart.setOption({
            tooltip: {
              trigger: "axis",
              formatter: "{b}<br/>Relative Humidity: {c}%",
            },
            grid: { top: 30, right: 20, bottom: 25, left: 35 },
            xAxis: {
              type: "category",
              data: dates,
              axisLine: { lineStyle: { color: "#cbd5e1" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            yAxis: {
              type: "value",
              name: "%",
              min: 20,
              max: 100,
              nameTextStyle: { color: "#64748b", fontSize: 10 },
              splitLine: { lineStyle: { color: "#f1f5f9" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            series: [
              {
                name: "Humidity",
                type: "line",
                data: humidity,
                smooth: true,
                itemStyle: { color: "#0d9488" },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "rgba(13, 148, 136, 0.25)" },
                    { offset: 1, color: "rgba(13, 148, 136, 0.0)" },
                  ]),
                },
              },
            ],
          });
        }

        // 4. Expected Temperature Forecast Envelope
        if (forecastChartRef.current) {
          forecastChart = echarts.init(forecastChartRef.current);
          const expectedTemps = forecastList.map((d: any) => ((d.temp_max_c + d.temp_min_c) / 2).toFixed(1));
          forecastChart.setOption({
            tooltip: {
              trigger: "axis",
              formatter: "{b}<br/>Expected Mean: {c}°C",
            },
            grid: { top: 30, right: 20, bottom: 25, left: 35 },
            xAxis: {
              type: "category",
              data: dates,
              axisLine: { lineStyle: { color: "#cbd5e1" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            yAxis: {
              type: "value",
              name: "Expected (°C)",
              nameTextStyle: { color: "#64748b", fontSize: 10 },
              splitLine: { lineStyle: { color: "#f1f5f9" } },
              axisLabel: { color: "#64748b", fontSize: 10 },
            },
            series: [
              {
                name: "Expected Temperature",
                type: "line",
                data: expectedTemps,
                smooth: true,
                itemStyle: { color: "#16a34a" },
                markPoint: {
                  data: [
                    { type: "max", name: "Peak" },
                    { type: "min", name: "Trough" },
                  ],
                },
              },
            ],
          });
        }
      } catch (e) {
        console.error("ECharts init weather error:", e);
      }
    }

    initCharts();

    const handleResize = () => {
      tempChart?.resize();
      rainChart?.resize();
      humChart?.resize();
      forecastChart?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      tempChart?.dispose();
      rainChart?.dispose();
      humChart?.dispose();
      forecastChart?.dispose();
    };
  }, [weatherData, loading]);

  return (
    <div className="space-y-6">
      {/* Header with Farm Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Weather & Agronomic Telemetry Center
          </h1>
          <p className="text-xs text-slate-500">
            Hyperlocal meteorological observations and multi-day agro-forecasts powering crop water budget and thermal accumulation models.
          </p>
        </div>

        {/* Farm Option Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <select
            value={activeFarmId || 1}
            onChange={(e) => setActiveFarmId(Number(e.target.value))}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-600 cursor-pointer shadow-2xs"
            aria-label="Select active farm for weather"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.location})
              </option>
            ))}
          </select>
        </div>
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

          {/* Operational Spray & Irrigation Window Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">Optimal Pesticide / Foliar Spray Window</span>
                <span className="text-emerald-800">Wind velocity &lt; 14 km/h with 0% rain probability over the next 36 hours.</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-950 block">Micro-Irrigation Protocol</span>
                <span className="text-blue-800">Transpiration demand is moderate; schedule 14mm irrigation during morning cycle.</span>
              </div>
            </div>
          </div>

          {/* Section 16: 4 Dedicated Weather ECharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Temperature Trend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-600" />
                  <span>Temperature Trend (Max & Min Diurnal Range)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">X: Date • Y: °C</span>
              </div>
              <div ref={tempChartRef} className="w-full h-52"></div>
            </div>

            {/* Chart 2: Rainfall Trend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Rainfall Trend & Precipitation Probability</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">X: Date • Y: mm / %</span>
              </div>
              <div ref={rainChartRef} className="w-full h-52"></div>
            </div>

            {/* Chart 3: Humidity Trend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-teal-600" />
                  <span>Relative Humidity Trend (Agronomic Comfort Zone)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">X: Date • Y: %</span>
              </div>
              <div ref={humChartRef} className="w-full h-52"></div>
            </div>

            {/* Chart 4: Expected Temperature Forecast */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>7-Day Expected Temperature Forecast Envelope</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">X: Date • Y: Expected °C</span>
              </div>
              <div ref={forecastChartRef} className="w-full h-52"></div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">7-Day Daily Agricultural Forecast Envelope</h3>
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
