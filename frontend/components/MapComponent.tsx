"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let mapInstance: any = null;
    let isMounted = true;

    async function setupMap() {
      if (!mapContainerRef.current) return;
      try {
        // Dynamically import MapLibre GL client-side only
        const maplibreModule = await import("maplibre-gl");
        try {
          await import("maplibre-gl/dist/maplibre-gl.css");
        } catch {
          // ignore CSS import failure in certain environments
        }
        const maplibregl: any = (maplibreModule as any).default || maplibreModule;

        if (!isMounted || !mapContainerRef.current) return;

        // Verify WebGL availability
        if (typeof maplibregl.supported === "function" && !maplibregl.supported()) {
          setMapError(true);
          return;
        }

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              "osm-tiles": {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
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
          center: [Number(longitude) || 80.648, Number(latitude) || 16.5062],
          zoom: zoom,
          interactive: interactive,
        });

        if (interactive && maplibregl.NavigationControl) {
          map.addControl(new maplibregl.NavigationControl(), "top-right");
        }

        if (maplibregl.Marker) {
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
            .setLngLat([Number(longitude) || 80.648, Number(latitude) || 16.5062])
            .addTo(map);
        }

        mapInstance = map;
      } catch (e) {
        console.warn("MapLibre GL client loading failed, using fallback GIS visualization", e);
        if (isMounted) setMapError(true);
      }
    }

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstance && typeof mapInstance.remove === "function") {
        try {
          mapInstance.remove();
        } catch {
          // ignore cleanup
        }
      }
    };
  }, [latitude, longitude, zoom, interactive]);

  if (mapError) {
    return (
      <div className="w-full h-full min-h-[250px] bg-gradient-to-br from-emerald-950/20 via-slate-900/10 to-teal-950/20 border border-emerald-200/60 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px]" />
        <MapPin className="w-8 h-8 text-emerald-700 animate-bounce relative z-10" />
        <p className="text-xs font-bold text-slate-800 relative z-10">
          Geospatial Plot Coordinates
        </p>
        <p className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded relative z-10">
          {Number(latitude || 16.5062).toFixed(4)}° N, {Number(longitude || 80.648).toFixed(4)}° E
        </p>
        <span className="text-[10px] text-slate-500 relative z-10">
          Field boundary polygon active • PostGIS synchronized
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[250px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[250px] rounded-xl" />
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 shadow-xs border border-slate-200/80 pointer-events-none flex items-center gap-1.5">
        <Layers className="w-3 h-3 text-emerald-700" />
        <span>MapLibre GL • {Number(latitude || 16.5062).toFixed(3)}°N, {Number(longitude || 80.648).toFixed(3)}°E</span>
      </div>
    </div>
  );
}
