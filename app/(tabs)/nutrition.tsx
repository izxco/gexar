import { useCallback } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "@/components/AppBar";
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
      <View className="bg-mfp-bg-top rounded-b-[28px] pb-4">
        <AppBar
          title={
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <AppText className="text-gray-900 text-2xl" fontWeight="bold">
                Nutrizione
              </AppText>
              <View className="bg-primary/10 rounded-md px-1.5 py-0.5">
                <AppText className="text-primary text-[10px] font-bold tracking-wider">
                  GEXAR FIT
                </AppText>
              </View>
            </View>
          }
          rightAction={
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/barcode-scan")}
              className="flex-row items-center gap-1.5 bg-white rounded-full px-3 py-1.5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="barcode-outline" size={18} color="#016F47" />
              <AppText className="text-gray-900 text-xs" fontWeight="bold">
                Scansiona
              </AppText>
            </Pressable>
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
          <AppText className="text-gray-900 text-xl" fontWeight="bold">
            Diario Pasti
          </AppText>
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/barcode-scan")}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="scan" size={16} color="#016F47" />
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
