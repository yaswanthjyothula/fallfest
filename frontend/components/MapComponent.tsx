"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Layers } from "lucide-react";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  interactive?: boolean;
}

export default function MapComponent({
  latitude,
  longitude,
  zoom = 13,
  interactive = true,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Initialize MapLibre GL with OpenStreetMap raster tiles
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [longitude, latitude],
        zoom: zoom,
        interactive: interactive,
      });

      // Add navigation controls
      if (interactive) {
        map.addControl(new maplibregl.NavigationControl(), "top-right");
      }

      // Add agricultural farm marker
      const markerEl = document.createElement("div");
      markerEl.className = "farm-pin";
      markerEl.style.width = "28px";
      markerEl.style.height = "28px";
      markerEl.style.backgroundColor = "#15803d";
      markerEl.style.borderRadius = "50%";
      markerEl.style.border = "3px solid white";
      markerEl.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "white";
      markerEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([longitude, latitude])
        .addTo(map);

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (e) {
      console.warn("MapLibre GL failed to initialize (e.g. headless WebGL environment)", e);
      setMapError(true);
    }
  }, [latitude, longitude, zoom, interactive]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-emerald-900/10 border border-emerald-200/60 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-2">
        <MapPin className="w-8 h-8 text-emerald-700 animate-bounce" />
        <p className="text-xs font-bold text-slate-800">
          Geospatial Plot Coordinates
        </p>
        <p className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
          {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
        </p>
        <span className="text-[10px] text-slate-400">
          OpenStreetMap tiles & PostGIS polygon overlay
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[250px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[250px] rounded-xl" />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 shadow-xs border border-slate-200/80 pointer-events-none flex items-center gap-1.5">
        <Layers className="w-3 h-3 text-emerald-700" />
        <span>MapLibre GL • {latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E</span>
      </div>
    </div>
  );
}
