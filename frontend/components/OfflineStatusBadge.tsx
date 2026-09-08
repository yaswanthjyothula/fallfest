"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { offlineSync, PendingSyncItem } from "@/lib/offlineSync";

export function OfflineStatusBadge() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const checkStatus = () => {
    setIsOnline(offlineSync.isOnline());
    setPendingCount(offlineSync.getPendingQueue().length);
  };

  useEffect(() => {
    checkStatus();
    window.addEventListener("online", checkStatus);
    window.addEventListener("offline", checkStatus);
    const interval = setInterval(checkStatus, 4000);
    return () => {
      window.removeEventListener("online", checkStatus);
      window.removeEventListener("offline", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || pendingCount === 0 || syncing) return;
    setSyncing(true);
    setSyncMsg("Syncing local farm records...");
    const res = await offlineSync.flushQueue();
    setSyncing(false);
    checkStatus();
    setSyncMsg(`Synced ${res.synced} item(s)`);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  if (isOnline && pendingCount === 0 && !syncMsg) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        <span>Online</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
        <WifiOff className="w-3 h-3 text-amber-600" />
        <span>Offline Mode</span>
        {pendingCount > 0 && (
          <span className="bg-amber-200/80 px-1.5 py-0.2 rounded text-[10px] font-bold">
            {pendingCount} Queued
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {syncMsg ? (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>{syncMsg}</span>
        </div>
      ) : (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-[11px] font-medium border border-blue-200"
          title="Click to push offline changes to cloud"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
          <span>Sync Pending ({pendingCount})</span>
        </button>
      )}
    </div>
  );
}
