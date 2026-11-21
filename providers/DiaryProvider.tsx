import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Crypto from "expo-crypto";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import type { Meal } from "@/lib/constants";

export interface FoodEntry {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  meal: Meal;
  servingLabel: string;
  numberOfServings: number;
  caloriesPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  proteinPerServing: number;
  loggedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodEntryTotals {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

export function getEntryTotals(entry: FoodEntry): FoodEntryTotals {
  const multiplier = entry.numberOfServings;
  return {
    calories: entry.caloriesPerServing * multiplier,
    carbs: entry.carbsPerServing * multiplier,
    fat: entry.fatPerServing * multiplier,
    protein: entry.proteinPerServing * multiplier,
  };
}

export interface AddEntryInput {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  meal: Meal;
  servingLabel: string;
  numberOfServings: number;
  caloriesPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  proteinPerServing: number;
  loggedDate?: string;
}

export interface UpdateEntryInput {
  name?: string;
  meal?: Meal;
  servingLabel?: string;
  numberOfServings?: number;
  caloriesPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
  proteinPerServing?: number;
}

export interface FoodHistoryItem {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  servingLabel: string;
  caloriesPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  proteinPerServing: number;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function entriesCacheKey(date: string): string {
  return `${CACHE_KEYS.FOOD_ENTRIES_PREFIX}:${date}`;
}

function pushHistory(item: FoodHistoryItem) {
  const existing = Cache.get<FoodHistoryItem[]>(CACHE_KEYS.FOOD_HISTORY) ?? [];
  const filtered = existing.filter((h) =>
    item.barcode ? h.barcode !== item.barcode : h.name !== item.name
  );
  const next = [item, ...filtered].slice(0, 30);
  Cache.set(CACHE_KEYS.FOOD_HISTORY, next);
}

type DiaryContextType = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  entries: FoodEntry[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  totals: FoodEntryTotals;
  entriesByMeal: Record<Meal, FoodEntry[]>;
  refresh: () => Promise<void>;
  addEntry: (input: AddEntryInput) => Promise<FoodEntry>;
  updateEntry: (id: string, updates: UpdateEntryInput) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  history: FoodHistoryItem[];
};

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export function useDiary() {
  const context = useContext(DiaryContext);
  if (context === undefined) {
    throw new Error("useDiary must be used within a DiaryProvider");
  }
  return context;
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    return Cache.get<FoodEntry[]>(entriesCacheKey(todayIso())) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const cached = Cache.get<FoodEntry[]>(entriesCacheKey(selectedDate)) ?? [];
      setEntries(cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diary");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const cached = Cache.get<FoodEntry[]>(entriesCacheKey(selectedDate)) ?? [];
    setEntries(cached);
  }, [selectedDate]);

  const addEntry = useCallback(
    async (input: AddEntryInput): Promise<FoodEntry> => {
      const loggedDate = input.loggedDate ?? selectedDate;
      const created: FoodEntry = {
        id: Crypto.randomUUID(),
        name: input.name,
        brand: input.brand ?? null,
        barcode: input.barcode ?? null,
        meal: input.meal,
        servingLabel: input.servingLabel,
        numberOfServings: input.numberOfServings,
        caloriesPerServing: input.caloriesPerServing,
        carbsPerServing: input.carbsPerServing,
        fatPerServing: input.fatPerServing,
        proteinPerServing: input.proteinPerServing,
        loggedDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dateEntries = Cache.get<FoodEntry[]>(entriesCacheKey(loggedDate)) ?? [];
      const nextDateEntries = [...dateEntries, created];
      Cache.set(entriesCacheKey(loggedDate), nextDateEntries);

      if (loggedDate === selectedDate) {
        setEntries(nextDateEntries);
      }

      pushHistory({
        name: created.name,
        brand: created.brand,
        barcode: created.barcode,
        servingLabel: created.servingLabel,
        caloriesPerServing: created.caloriesPerServing,
        carbsPerServing: created.carbsPerServing,
        fatPerServing: created.fatPerServing,
        proteinPerServing: created.proteinPerServing,
      });

      return created;
    },
    [selectedDate]
  );

  const updateEntry = useCallback(
    async (id: string, updates: UpdateEntryInput) => {
      const current = Cache.get<FoodEntry[]>(entriesCacheKey(selectedDate)) ?? entries;
      const next = current.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      Cache.set(entriesCacheKey(selectedDate), next);
      setEntries(next);
    },
    [entries, selectedDate]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      const current = Cache.get<FoodEntry[]>(entriesCacheKey(selectedDate)) ?? entries;
      const next = current.filter((e) => e.id !== id);
      Cache.set(entriesCacheKey(selectedDate), next);
      setEntries(next);
    },
    [entries, selectedDate]
  );

  const totals = useMemo<FoodEntryTotals>(() => {
    return entries.reduce(
      (acc, entry) => {
        const t = getEntryTotals(entry);
        return {
          calories: acc.calories + t.calories,
          carbs: acc.carbs + t.carbs,
          fat: acc.fat + t.fat,
          protein: acc.protein + t.protein,
        };
      },
      { calories: 0, carbs: 0, fat: 0, protein: 0 }
    );
  }, [entries]);

  const entriesByMeal = useMemo<Record<Meal, FoodEntry[]>>(() => {
    const grouped: Record<Meal, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    for (const entry of entries) {
      if (grouped[entry.meal]) {
        grouped[entry.meal].push(entry);
      }
    }
    return grouped;
  }, [entries]);

  const history = useMemo(
    () => Cache.get<FoodHistoryItem[]>(CACHE_KEYS.FOOD_HISTORY) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries]
  );

  const value: DiaryContextType = {
    selectedDate,
    setSelectedDate,
    entries,
    loading,
    refreshing,
    error,
    totals,
    entriesByMeal,
    refresh,
    addEntry,
    updateEntry,
    removeEntry,
    history,
  };

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  );
}
