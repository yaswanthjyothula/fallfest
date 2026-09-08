"use client";

export interface PendingSyncItem {
  id: string;
  type: "harvest_record" | "field_observation" | "prediction_input";
  payload: any;
  timestamp: string;
  status: "pending" | "syncing" | "failed";
}

const STORAGE_KEY_PENDING = "agriquantum_pending_sync_queue";
const STORAGE_KEY_OFFLINE_TWIN = "agriquantum_offline_twin_cache";

export const offlineSync = {
  isOnline(): boolean {
    if (typeof window === "undefined") return true;
    return window.navigator.onLine;
  },

  getPendingQueue(): PendingSyncItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PENDING);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  queueItem(type: PendingSyncItem["type"], payload: any): PendingSyncItem {
    const item: PendingSyncItem = {
      id: "sync_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      type,
      payload,
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    const queue = this.getPendingQueue();
    queue.push(item);
    try {
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(queue));
    } catch (e) {
      console.error("Failed to store pending sync item", e);
    }
    return item;
  },

  cacheTwin(farmId: number, data: any) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${STORAGE_KEY_OFFLINE_TWIN}_${farmId}`, JSON.stringify({
        cached_at: new Date().toISOString(),
        data,
      }));
    } catch (e) {
      console.warn("Could not cache offline twin", e);
    }
  },

  getCachedTwin(farmId: number): any | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_OFFLINE_TWIN}_${farmId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch {
      return null;
    }
  },

  async flushQueue(apiBaseUrl: string = "http://localhost:8000"): Promise<{ synced: number; failed: number }> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remaining: PendingSyncItem[] = [];

    for (const item of queue) {
      try {
        if (item.type === "harvest_record") {
          const farmId = item.payload.farm_id;
          const res = await fetch(`${apiBaseUrl}/api/v1/farms/${farmId}/harvest-actuals`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
          if (res.ok) {
            synced++;
          } else {
            failed++;
            remaining.push(item);
          }
        } else {
          synced++;
        }
      } catch (err) {
        failed++;
        remaining.push(item);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(remaining));
    } catch (e) {
      console.error("Error saving pending queue", e);
    }

    return { synced, failed };
  },
};
