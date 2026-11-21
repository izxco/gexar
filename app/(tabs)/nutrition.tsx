import { useCallback } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HeaderPill, ModuleHeader } from "@/components/brand/ModuleHeader";
import { AppText } from "@/components/AppText";
import { CaloriesCard } from "@/components/CaloriesCard";
import { MacrosCard } from "@/components/MacrosCard";
import { MealCard } from "@/components/MealCard";
import { colors as appColors, dailyGoals, MEALS, MEAL_LABELS, type Meal } from "@/lib/constants";
import { useDiary, type FoodEntry } from "@/providers/DiaryProvider";
import { WeekStrip } from "@/components/WeekStrip";

export default function NutritionScreen() {
  const {
    selectedDate,
    setSelectedDate,
    entries,
    entriesByMeal,
    totals,
    refresh,
    refreshing,
    removeEntry,
  } = useDiary();

  const handleLog = useCallback((meal: Meal) => {
    router.push({ pathname: "/log-food", params: { meal } });
  }, []);

  const handlePressEntry = useCallback((entry: FoodEntry) => {
    router.push({ pathname: "/edit-entry", params: { entryId: entry.id } });
  }, []);

  const handleClearMeal = useCallback(
    (meal: Meal) => {
      const mealEntries = entriesByMeal[meal];
      if (!mealEntries || mealEntries.length === 0) return;
      Alert.alert(
        `Svuota ${MEAL_LABELS[meal]}`,
        "Rimuovere tutti gli alimenti registrati per questo pasto?",
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Rimuovi",
            style: "destructive",
            onPress: () => mealEntries.forEach((entry) => removeEntry(entry.id)),
          },
        ]
      );
    },
    [entriesByMeal, removeEntry]
  );

  return (
    <View className="flex-1 bg-mfp-bg">
      <View className="bg-mfp-bg-top rounded-b-[32px] pb-3">
        <ModuleHeader
          module="nutrition"
          title="Diario"
          accent="pasti"
          right={
            <HeaderPill
              label="Scansiona"
              onPress={() => router.push("/barcode-scan")}
              icon={<Ionicons name="barcode-outline" size={15} color="#E1290A" />}
            />
          }
        />
        <WeekStrip
          selectedDate={selectedDate}
          selectedDateHasEntries={entries.length > 0}
          onSelectDate={setSelectedDate}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={appColors.primary}
          />
        }
      >
        <CaloriesCard consumed={totals.calories} goal={dailyGoals.calories} />
        <MacrosCard
          carbs={totals.carbs}
          fat={totals.fat}
          protein={totals.protein}
          goals={dailyGoals}
        />

        <View className="flex-row items-center justify-between mt-2">
          <AppText variant="serif" className="text-ink text-[28px]">
            Pasti di oggi
          </AppText>
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/barcode-scan")}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="scan" size={16} color="#E1290A" />
            <AppText className="text-primary text-sm" fontWeight="bold">
              Scanner Rapido
            </AppText>
          </Pressable>
        </View>

        <View style={{ gap: 12 }}>
          {MEALS.map((meal) => (
            <MealCard
              key={meal}
              meal={meal}
              entries={entriesByMeal[meal] ?? []}
              onLog={() => handleLog(meal)}
              onPressEntry={handlePressEntry}
              onClear={() => handleClearMeal(meal)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
