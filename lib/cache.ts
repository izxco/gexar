import * as FileSystem from "expo-file-system/legacy";

const CACHE_FILE = `${FileSystem.documentDirectory || ""}gexar_cache.json`;

// In-memory store for instant synchronous read/write
const memoryStore = new Map<string, string>();
let isLoaded = false;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// Load persisted data on startup
export async function initCache(): Promise<void> {
  if (isLoaded || !FileSystem.documentDirectory) return;
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(CACHE_FILE);
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && parsed !== null) {
        for (const [k, v] of Object.entries(parsed)) {
          memoryStore.set(k, String(v));
        }
      }
    }
  } catch (e) {
    console.warn("[Cache] Could not load persisted cache:", e);
  } finally {
    isLoaded = true;
  }
}

// Start loading immediately in background
initCache();

// Debounced save to file system
function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      if (!FileSystem.documentDirectory) return;
      const obj: Record<string, string> = {};
      for (const [k, v] of memoryStore.entries()) {
        obj[k] = v;
      }
      await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(obj));
    } catch (e) {
      console.warn("[Cache] Could not persist cache:", e);
    }
  }, 250);
}

export const Cache = {
  /**
   * Save any data with type safety
   */
  set: <T>(key: string, value: T) => {
    memoryStore.set(key, JSON.stringify(value));
    scheduleSave();
  },

  /**
   * Retrieve data. Returns null if key doesn't exist.
   */
  get: <T>(key: string): T | null => {
    const json = memoryStore.get(key);
    if (!json) return null;

    try {
      return JSON.parse(json) as T;
    } catch (e) {
      console.error("[Cache] Failed to parse cache key:", key, e);
      return null;
    }
  },

  /**
   * Delete specific key
   */
  remove: (key: string) => {
    memoryStore.delete(key);
    scheduleSave();
  },

  /**
   * Clear all cached data
   */
  clearAll: () => {
    memoryStore.clear();
    scheduleSave();
  },

  init: initCache,

  /**
   * Generates a complete JSON backup file and returns its path
   */
  exportBackup: async (): Promise<string> => {
    const exportData = {
      app: "GEXAR FIT",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      entries: Object.fromEntries(memoryStore.entries()),
    };
    const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
    const dateStr = new Date().toISOString().slice(0, 10);
    const exportPath = `${targetDir}GEXAR_FIT_Backup_${dateStr}.json`;
    await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(exportData, null, 2));
    return exportPath;
  },
};

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: "user_profile",
  TEMPLATES: "templates",
  WORKOUTS: "workouts",
  FOOD_ENTRIES_PREFIX: "food_entries",
  FOOD_HISTORY: "food_history",
} as const;
