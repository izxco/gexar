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
import type { CreateWorkoutInput, Workout, WorkoutBestSet } from "@/lib/types";

type WorkoutsContextType = {
  items: Workout[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createWorkout: (input: CreateWorkoutInput) => Promise<Workout>;
  removeWorkout: (workoutId: string) => Promise<void>;
};

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(
  undefined
);

export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (context === undefined) {
    throw new Error("useWorkouts must be used within a WorkoutsProvider");
  }
  return context;
}

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Workout[]>(
    () => Cache.get<Workout[]>(CACHE_KEYS.WORKOUTS) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const cached = Cache.get<Workout[]>(CACHE_KEYS.WORKOUTS) ?? [];
      setItems(cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const createWorkout = useCallback(async (input: CreateWorkoutInput): Promise<Workout> => {
    const workoutId = Crypto.randomUUID();
    const created: Workout = {
      id: workoutId,
      name: input.name,
      startedAt: input.startedAt,
      completedAt: input.completedAt ?? new Date().toISOString(),
      durationSeconds: input.durationSeconds,
      totalVolume: input.totalVolume,
      prCount: input.prCount ?? 0,
      createdAt: new Date().toISOString(),
      exercises: input.exercises.map((exercise) => {
        const workoutExerciseId = Crypto.randomUUID();
        const sets = exercise.sets.map((set) => ({
          id: Crypto.randomUUID(),
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        }));

        let bestSet: WorkoutBestSet | null = null;
        for (const s of sets) {
          if (
            !bestSet ||
            s.weight > bestSet.weight ||
            (s.weight === bestSet.weight && s.reps > bestSet.reps)
          ) {
            bestSet = { weight: s.weight, reps: s.reps };
          }
        }

        return {
          id: workoutExerciseId,
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          bodyPart: exercise.bodyPart ?? null,
          setCount: sets.length,
          bestSet,
          sets,
        };
      }),
    };

    setItems((prev) => {
      const next = [created, ...prev.filter((w) => w.id !== created.id)];
      Cache.set(CACHE_KEYS.WORKOUTS, next);
      return next;
    });

    return created;
  }, []);

  const removeWorkout = useCallback(
    async (workoutId: string) => {
      setItems((prev) => {
        const next = prev.filter((w) => w.id !== workoutId);
        Cache.set(CACHE_KEYS.WORKOUTS, next);
        return next;
      });
    },
    []
  );

  const value: WorkoutsContextType = {
    items,
    loading,
    refreshing,
    error,
    refresh,
    createWorkout,
    removeWorkout,
  };

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}
