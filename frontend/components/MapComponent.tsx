"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Layers, Compass } from "lucide-react";

interface MapComponentProps {
  // Farm coordinates
  farmLatitude?: number;
  farmLongitude?: number;
  farmName?: string;
  // User live location coordinates
  userLatitude?: number;
  userLongitude?: number;
  userAccuracy?: number;
  userLocationStatus?: string;
  // Legacy single-point support
  latitude?: number;
  longitude?: number;
  zoom?: number;
  interactive?: boolean;
  centerTarget?: "farm" | "user";
}

export default function MapComponent({
  farmLatitude,
  farmLongitude,
  farmName = "Selected Farm",
  userLatitude,
  userLongitude,
  userAccuracy,
  userLocationStatus,
  latitude,
  longitude,
  zoom = 13,
  interactive = true,
  centerTarget = "farm",
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const farmMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const maplibreglRef = useRef<any>(null);

  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userHasPanned, setUserHasPanned] = useState(false);

  // Determine effective coordinates
  const effectiveFarmLat = farmLatitude ?? latitude;
  const effectiveFarmLon = farmLongitude ?? longitude;
  const hasFarmCoords = Boolean(effectiveFarmLat && effectiveFarmLon && !isNaN(effectiveFarmLat) && !isNaN(effectiveFarmLon));
  const hasUserCoords = Boolean(userLatitude && userLongitude && !isNaN(userLatitude) && !isNaN(userLongitude));

  // 1. Initialize MapLibre GL
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const maplibreModule = await import("maplibre-gl");
        try {
          await import("maplibre-gl/dist/maplibre-gl.css");
        } catch {
          // ignore CSS import failure in certain environments
        }
        const maplibregl: any = (maplibreModule as any).default || maplibreModule;
        maplibreglRef.current = maplibregl;

        if (!isMounted || !mapContainerRef.current) return;

        if (typeof maplibregl.supported === "function" && !maplibregl.supported()) {
          setMapError(true);
          return;
        }

        // Determine initial center
        let initialCenter = [0.0, 0.0];
        let initialZoom = 2;

        if (centerTarget === "user" && hasUserCoords) {
          initialCenter = [userLongitude!, userLatitude!];
          initialZoom = zoom;
        } else if (hasFarmCoords) {
          initialCenter = [effectiveFarmLon!, effectiveFarmLat!];
          initialZoom = zoom;
        } else if (hasUserCoords) {
          initialCenter = [userLongitude!, userLatitude!];
          initialZoom = zoom;
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
          center: initialCenter,
          zoom: initialZoom,
          interactive,
        });

        if (interactive && maplibregl.NavigationControl) {
          map.addControl(new maplibregl.NavigationControl(), "top-right");
        }

        map.on("load", () => {
          if (!isMounted) return;
          mapInstanceRef.current = map;
          setMapLoaded(true);
        });

        map.on("dragstart", () => {
          setUserHasPanned(true);
        });
      } catch (err) {
        console.warn("MapLibre GL initialization notice:", err);
        if (isMounted) setMapError(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Manage Farm Marker (Emerald Pin)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !maplibreglRef.current) return;
    const map = mapInstanceRef.current;
    const maplibregl = maplibreglRef.current;

    if (hasFarmCoords) {
      const coords = [effectiveFarmLon!, effectiveFarmLat!];
      if (!farmMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "farm-location-marker";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.backgroundColor = "#059669";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 4px 12px rgba(5, 150, 105, 0.45)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "white";
        el.style.cursor = "pointer";
        el.title = farmName;
        el.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `;

        farmMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map);
      } else {
        farmMarkerRef.current.setLngLat(coords);
      }

      // Initial center if user hasn't panned
      if (!userHasPanned && centerTarget === "farm") {
        map.setCenter(coords);
      }
    } else if (farmMarkerRef.current) {
      farmMarkerRef.current.remove();
      farmMarkerRef.current = null;
    }
  }, [mapLoaded, hasFarmCoords, effectiveFarmLat, effectiveFarmLon, farmName, userHasPanned, centerTarget]);

  // 3. Manage User Location Marker (Blue Pulsating Radar Dot)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !maplibreglRef.current) return;
    const map = mapInstanceRef.current;
    const maplibregl = maplibreglRef.current;

    if (hasUserCoords) {
      const userCoords = [userLongitude!, userLatitude!];

      if (!userMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "user-location-marker relative flex items-center justify-center";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.cursor = "pointer";
        el.title = `Your Current Location ${userAccuracy ? `(±${Math.round(userAccuracy)}m)` : ""}`;
        el.innerHTML = `
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2563eb; border: 2.5px solid white; box-shadow: 0 0 8px rgba(37, 99, 235, 0.8);"></div>
        `;

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(userCoords)
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat(userCoords);
      }

      if (!userHasPanned && centerTarget === "user") {
        map.setCenter(userCoords);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [mapLoaded, hasUserCoords, userLatitude, userLongitude, userAccuracy, userHasPanned, centerTarget]);

  // Center Controls
  const handleCenterOnUser = useCallback(() => {
    if (mapInstanceRef.current && hasUserCoords) {
      mapInstanceRef.current.flyTo({
        center: [userLongitude!, userLatitude!],
        zoom: Math.max(zoom, 14),
        essential: true,
      });
      setUserHasPanned(false);
    }
  }, [hasUserCoords, userLatitude, userLongitude, zoom]);

  const handleCenterOnFarm = useCallback(() => {
    if (mapInstanceRef.current && hasFarmCoords) {
      mapInstanceRef.current.flyTo({
        center: [effectiveFarmLon!, effectiveFarmLat!],
        zoom: Math.max(zoom, 13),
        essential: true,
      });
      setUserHasPanned(false);
    }
  }, [hasFarmCoords, effectiveFarmLat, effectiveFarmLon, zoom]);

  if (mapError || (!hasFarmCoords && !hasUserCoords)) {
    return (
      <div className="w-full h-full min-h-[250px] bg-slate-900/10 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Compass className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-700">
          {mapError ? "Geospatial Map Rendering Offline" : "Awaiting Active Farm or Location Coordinates"}
        </p>
        <p className="text-[11px] text-slate-500 max-w-xs">
          Select a farm holding or enable browser GPS location to render field boundaries and live positioning.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[250px] rounded-xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full min-h-[250px]" />

      {/* Floating Center Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        {hasUserCoords && (
          <button
            type="button"
            onClick={handleCenterOnUser}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-blue-700 font-semibold text-[11px] shadow-sm border border-slate-200 backdrop-blur-xs transition cursor-pointer"
            title="Recenter camera on your current live position"
          >
            <Navigation className="w-3.5 h-3.5 fill-blue-600" />
            <span>Center on Me</span>
          </button>
        )}

        {hasFarmCoords && (
          <button
            type="button"
            onClick={handleCenterOnFarm}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-emerald-800 font-semibold text-[11px] shadow-sm border border-slate-200 backdrop-blur-xs transition cursor-pointer"
            title="Recenter camera on farm field boundary"
          >
            <MapPin className="w-3.5 h-3.5 fill-emerald-600" />
            <span>Center on Farm</span>
          </button>
        )}
      </div>

      {/* Map Legend / Status Footer */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-md text-[10px] font-mono text-slate-700 shadow-xs border border-slate-200/80 pointer-events-none flex items-center gap-3">
        {hasFarmCoords && (
          <span className="flex items-center gap-1 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Farm: {effectiveFarmLat!.toFixed(4)}°N, {effectiveFarmLon!.toFixed(4)}°E
          </span>
        )}
        {hasUserCoords && (
          <span className="flex items-center gap-1 text-blue-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            You: {userLatitude!.toFixed(4)}°N, {userLongitude!.toFixed(4)}°E
          </span>
        )}
      </div>
    </div>
  );
}
