import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Crypto from "expo-crypto";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import type { CreateTemplateInput, Template } from "@/lib/types";
import { EXAMPLE_TEMPLATES, exampleTemplateToInput } from "@/data/example-templates";

type TemplatesContextType = {
  items: Template[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTemplate: (input: CreateTemplateInput) => Promise<Template>;
  removeTemplate: (templateId: string) => Promise<void>;
};

const TemplatesContext = createContext<TemplatesContextType | undefined>(
  undefined
);

export function useTemplates() {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplatesProvider");
  }
  return context;
}

function initialSeed(): Template[] {
  const cached = Cache.get<Template[]>(CACHE_KEYS.TEMPLATES);
  if (cached && cached.length > 0) return cached;

  const seeded: Template[] = EXAMPLE_TEMPLATES.map((ex) => {
    const input = exampleTemplateToInput(ex);
    const templateId = Crypto.randomUUID();
    return {
      id: templateId,
      name: input.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: input.exercises.map((exercise, eIdx) => {
        const exerciseId = Crypto.randomUUID();
        return {
          id: exerciseId,
          templateId,
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          bodyPart: exercise.bodyPart ?? null,
          position: eIdx,
          restSeconds: exercise.restSeconds ?? 90,
          sets: exercise.sets.map((set, sIdx) => ({
            id: Crypto.randomUUID(),
            templateExerciseId: exerciseId,
            position: sIdx,
            weight: set.weight,
            reps: set.reps,
          })),
        };
      }),
    };
  });

  Cache.set(CACHE_KEYS.TEMPLATES, seeded);
  return seeded;
}

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Template[]>(() => initialSeed());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const cached = Cache.get<Template[]>(CACHE_KEYS.TEMPLATES) ?? [];
      setItems(cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (input: CreateTemplateInput): Promise<Template> => {
    const templateId = Crypto.randomUUID();
    const created: Template = {
      id: templateId,
      name: input.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: input.exercises.map((exercise, eIdx) => {
        const templateExerciseId = Crypto.randomUUID();
        return {
          id: templateExerciseId,
          templateId,
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          bodyPart: exercise.bodyPart ?? null,
          position: eIdx,
          restSeconds: exercise.restSeconds ?? 90,
          sets: exercise.sets.map((set, sIdx) => ({
            id: Crypto.randomUUID(),
            templateExerciseId,
            position: sIdx,
            weight: set.weight,
            reps: set.reps,
          })),
        };
      }),
    };

    setItems((prev) => {
      const next = [created, ...prev.filter((t) => t.id !== created.id)];
      Cache.set(CACHE_KEYS.TEMPLATES, next);
      return next;
    });

    return created;
  }, []);

  const removeTemplate = useCallback(
    async (templateId: string) => {
      setItems((prev) => {
        const next = prev.filter((t) => t.id !== templateId);
        Cache.set(CACHE_KEYS.TEMPLATES, next);
        return next;
      });
    },
    []
  );

  const value: TemplatesContextType = {
    items,
    loading,
    refreshing,
    error,
    refresh,
    createTemplate,
    removeTemplate,
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
}
