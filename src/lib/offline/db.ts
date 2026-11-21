// Database helper for offline sync using IndexedDB
export interface SyncItem {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers: Record<string, string>;
  createdAt: number;
}

const DB_NAME = "santelink-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "sync-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB non supporté"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initOfflineDB(): Promise<void> {
  await openDB();
}

export async function addToSyncQueue(
  url: string,
  method: string,
  body?: string,
  headers: Record<string, string> = {}
): Promise<SyncItem> {
  const db = await openDB();
  const item: SyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    url,
    method,
    body,
    headers,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function getSyncQueue(): Promise<SyncItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function syncOfflineData(
  onItemProcessed?: (item: SyncItem, success: boolean) => void
): Promise<void> {
  const queue = await getSyncQueue();
  if (!queue || queue.length === 0) return;

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      if (response.ok) {
        await removeSyncItem(item.id);
        onItemProcessed?.(item, true);
      } else {
        onItemProcessed?.(item, false);
      }
    } catch {
      onItemProcessed?.(item, false);
    }
  }
}
