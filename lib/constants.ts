// Single source of truth for app colors.
// Used by both tailwind.config.js and direct style usage.
export const colors = {
  primary: "#016F47",
  "primary-foreground": "#FFFFFF",
  "muted-foreground": "#9D9D9D",
  white: "#FFFFFF",
  "low-shadow": "#D1D1D1",
  // Nutrition & MyFitnessPal palette
  "mfp-blue": "#1D63ED",
  "mfp-bg": "#EEF1F5",
  "mfp-bg-top": "#E4EEFB",
  carbs: "#2BC4A6",
  fat: "#7A3FB3",
  protein: "#F5A623",
  "track-gray": "#E7E9EC",
} as const;

// Daily nutrition goals shown on the Nutrition dashboard.
// Default: 2500 kcal, 300g carbs, 80g fat, 150g protein
export const dailyGoals = {
  calories: 2500,
  carbs: 300,
  fat: 80,
  protein: 150,
} as const;

export const MEALS = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Colazione",
  lunch: "Pranzo",
  dinner: "Cena",
  snacks: "Spuntini",
};
