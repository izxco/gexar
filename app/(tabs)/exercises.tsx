import { useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FITNESS_SEGMENTS, ModuleHeader, SegmentedNav } from "@/components/brand/ModuleHeader";
import { IconTile } from "@/components/brand/Icon3D";
import { AppText } from "@/components/AppText";
import { FilterChip } from "@/components/exercises/FilterChip";
import { ExerciseListItem } from "@/components/exercises/ExerciseListItem";
import { OptionSheet } from "@/components/OptionSheet";
import {
  BODY_PARTS,
  CATEGORIES,
  EXERCISES,
  type Exercise,
} from "@/data/exercises";
import { groupExercises } from "@/lib/group-exercises";

export default function ExercisesScreen() {
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "bodyPart" | "category">(null);

  const sections = useMemo(
    () => groupExercises(EXERCISES, { search, bodyPart, category }),
    [search, bodyPart, category]
  );

  return (
    <View className="flex-1 bg-canvas">
      <ModuleHeader module="fitness" title="Libreria" accent="esercizi">
        <SegmentedNav items={FITNESS_SEGMENTS} active="exercises" />
      </ModuleHeader>

      <View className="px-5">
        <View className="flex-row items-center bg-surface border border-line rounded-2xl px-3 h-11">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cerca esercizio"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-ink font-now-regular"
            style={{ fontSize: 16 }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center gap-2 mt-3">
          <FilterChip
            label={bodyPart ?? "Parte del corpo"}
            active={!!bodyPart}
            onPress={() => setSheet("bodyPart")}
            className="flex-1"
          />
          <FilterChip
            label={category ?? "Categoria"}
            active={!!category}
            onPress={() => setSheet("category")}
            className="flex-1"
          />
          <Pressable className="bg-surface border border-line rounded-lg w-11 h-9 items-center justify-center">
            <Ionicons name="swap-vertical" size={18} color="#374151" />
          </Pressable>
        </View>
      </View>

      <SectionList<Exercise>
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        className="flex-1 mt-2"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <View className="px-5 pt-3 pb-1 bg-canvas">
            <AppText className="text-muted-foreground text-xs tracking-widest" fontWeight="bold">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <ExerciseListItem exercise={item} showChevron />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-line ml-16" />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <IconTile name="zoom" size={72} />
            <AppText className="text-muted-foreground mt-3">Nessun esercizio trovato</AppText>
          </View>
        }
      />

      <OptionSheet
        visible={sheet === "bodyPart"}
        title="Parte del corpo"
        allLabel="Tutte"
        options={BODY_PARTS}
        selected={bodyPart}
        onSelect={setBodyPart}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === "category"}
        title="Categoria"
        allLabel="Tutte"
        options={CATEGORIES}
        selected={category}
        onSelect={setCategory}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
