// Single source of truth for app colors.
// Used by both tailwind.config.js and direct style usage.
//
// Gexar palette (from branding/gexar logos.zip):
//   - Gexar Orange #E1290A → primary brand colour, Fitness & Nutrition, all 3D icons
//   - Gexar Blue   #2300FF → secondary colour, Finance & Notes declinations
export const colors = {
  primary: "#E1290A",
  "primary-foreground": "#FFFFFF",
  "primary-soft": "#FCE7E1",
  "primary-deep": "#A81B04",
  accent: "#2300FF",
  "accent-soft": "#E9E5FF",
  ink: "#16120F",
  "muted-foreground": "#8C857E",
  canvas: "#F7F3EE",
  surface: "#FFFFFF",
  line: "#ECE5DD",
  white: "#FFFFFF",
  "low-shadow": "#E3D9CF",
  // Nutrition palette (keys kept from the MyFitnessPal base for compatibility)
  "mfp-blue": "#E1290A",
  "mfp-bg": "#F7F3EE",
  "mfp-bg-top": "#FBE6DE",
  carbs: "#FF9A3C",
  fat: "#2300FF",
  protein: "#E1290A",
  "track-gray": "#EFE8E1",
  // Finance
  income: "#0E9F6E",
  expense: "#E1290A",
} as const;

export const fonts = {
  regular: "now-regular",
  medium: "now-medium",
  bold: "now-bold",
  serif: "instrument-serif",
  serifItalic: "instrument-serif-italic",
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
