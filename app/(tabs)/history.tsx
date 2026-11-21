import { useMemo, useState } from "react";
import { Alert, SectionList, View } from "react-native";
import { FITNESS_SEGMENTS, ModuleHeader, SegmentedNav } from "@/components/brand/ModuleHeader";
import { IconTile } from "@/components/brand/Icon3D";
import { ActionMenu } from "@/components/ActionMenu";
import { AppText } from "@/components/AppText";
import { WorkoutHistoryCard } from "@/components/history/WorkoutHistoryCard";
import { formatMonthHeader } from "@/lib/format";
import { useWorkouts } from "@/providers/WorkoutsProvider";
import type { Workout } from "@/lib/types";

interface MonthSection {
  title: string;
  data: Workout[];
}

export default function HistoryScreen() {
  const { items, refreshing, refresh, removeWorkout } = useWorkouts();
  const [menuWorkout, setMenuWorkout] = useState<Workout | null>(null);

  const confirmDelete = (workout: Workout) => {
    Alert.alert(
      "Eliminare l'allenamento?",
      `"${workout.name}" verrà rimosso definitivamente dallo storico.`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () => removeWorkout(workout.id),
        },
      ]
    );
  };

  const sections = useMemo<MonthSection[]>(() => {
    const map = new Map<string, Workout[]>();
    for (const workout of items) {
      const key = formatMonthHeader(workout.startedAt);
      const bucket = map.get(key);
      if (bucket) bucket.push(workout);
      else map.set(key, [workout]);
    }
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [items]);

  return (
    <View className="flex-1 bg-canvas">
      <ModuleHeader
        module="fitness"
        title="Il tuo"
        accent="storico"
        subtitle={`${items.length} ${items.length === 1 ? "allenamento completato" : "allenamenti completati"}`}
      >
        <SegmentedNav items={FITNESS_SEGMENTS} active="history" />
      </ModuleHeader>

      <SectionList<Workout, MonthSection>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={refreshing}
        renderSectionHeader={({ section }) => (
          <AppText
            className="text-muted-foreground text-xs tracking-widest pt-4 pb-2"
            fontWeight="bold"
          >
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => (
          <View className="mb-3">
            <WorkoutHistoryCard
              workout={item}
              onPressMenu={() => setMenuWorkout(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-24 px-6">
            <IconTile name="calendar" size={84} />
            <AppText variant="serif" className="text-ink text-[28px] mt-4">
              Ancora nessun allenamento
            </AppText>
            <AppText className="text-muted-foreground text-center mt-2">
              Gli allenamenti completati compariranno qui.
            </AppText>
          </View>
        }
      />

      <ActionMenu
        visible={!!menuWorkout}
        title={menuWorkout?.name}
        items={[
          {
            label: "Elimina allenamento",
            icon: "trash-outline",
            destructive: true,
            onPress: () => {
              if (menuWorkout) confirmDelete(menuWorkout);
            },
          },
        ]}
        onClose={() => setMenuWorkout(null)}
      />
    </View>
  );
}
