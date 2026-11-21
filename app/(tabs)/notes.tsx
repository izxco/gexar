import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import { IconTile } from "@/components/brand/Icon3D";
import { HeaderPill, ModuleHeader } from "@/components/brand/ModuleHeader";
import { colors, fonts } from "@/lib/constants";
import { formatDayLabel, localIsoDate } from "@/lib/dates";
import { pagePreview, todoProgress, useNotes, type NotePage } from "@/providers/NotesProvider";

export default function NotesScreen() {
  const { pages, createPage } = useNotes();
  const [query, setQuery] = useState("");

  const { pinned, others } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...pages]
      .filter((p) => !q || p.title.toLowerCase().includes(q) || pagePreview(p).toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { pinned: sorted.filter((p) => p.pinned), others: sorted.filter((p) => !p.pinned) };
  }, [pages, query]);

  const openNew = () => {
    const page = createPage();
    router.push({ pathname: "/note/[id]", params: { id: page.id } });
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModuleHeader
          module="notes"
          title="Le tue"
          accent="idee"
          subtitle={`${pages.length} ${pages.length === 1 ? "pagina" : "pagine"}`}
          right={
            <HeaderPill
              label="Pagina"
              tone="solid"
              icon={<Ionicons name="add" size={14} color="#fff" />}
              onPress={openNew}
            />
          }
        >
          <View className="flex-row items-center bg-surface border border-line rounded-2xl px-3 h-11 mt-4">
            <Ionicons name="search" size={18} color={colors["muted-foreground"]} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cerca nelle note"
              placeholderTextColor={colors["muted-foreground"]}
              className="flex-1 ml-2 text-ink"
              style={{ fontFamily: fonts.regular, fontSize: 15 }}
            />
          </View>
        </ModuleHeader>

        <View className="px-5" style={{ gap: 10 }}>
          {pinned.length > 0 && (
            <>
              <SectionLabel>FISSATE</SectionLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {pinned.map((p) => (
                  <PinnedCard key={p.id} page={p} />
                ))}
              </ScrollView>
            </>
          )}

          <SectionLabel>TUTTE LE PAGINE</SectionLabel>
          {others.length === 0 && pinned.length === 0 ? (
            <Pressable
              onPress={openNew}
              className="border border-dashed border-line rounded-3xl py-8 items-center bg-surface"
            >
              <IconTile name="pencil" size={64} />
              <AppText fontWeight="bold" className="text-ink text-base mt-3">
                {query ? "Nessun risultato" : "Pagina bianca"}
              </AppText>
              <AppText className="text-muted-foreground text-sm mt-1">
                Tocca per scrivere una nuova pagina
              </AppText>
            </Pressable>
          ) : (
            <View className="bg-surface rounded-3xl border border-line overflow-hidden">
              {others.map((p, i) => (
                <PageRow key={p.id} page={p} first={i === 0} />
              ))}
              {others.length === 0 && (
                <AppText className="text-muted-foreground text-sm p-4">
                  Tutte le pagine sono fissate in alto.
                </AppText>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <AppText fontWeight="bold" className="text-muted-foreground text-xs tracking-widest mt-2">
      {children}
    </AppText>
  );
}

function openPage(page: NotePage) {
  router.push({ pathname: "/note/[id]", params: { id: page.id } });
}

function PinnedCard({ page }: { page: NotePage }) {
  const { done, total } = todoProgress(page);
  return (
    <Pressable
      onPress={() => openPage(page)}
      className="bg-surface rounded-3xl p-4 border border-line"
      style={{ width: 200 }}
    >
      <IconTile name={page.icon} size={46} />
      <AppText variant="serif" className="text-ink text-[22px] leading-[26px] mt-3" numberOfLines={2}>
        {page.title || "Senza titolo"}
      </AppText>
      <AppText className="text-muted-foreground text-xs mt-1" numberOfLines={2}>
        {pagePreview(page) || "Vuota"}
      </AppText>
      {total > 0 && (
        <View className="mt-3">
          <View className="h-1.5 bg-track-gray rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${(done / total) * 100}%` }} />
          </View>
          <AppText fontWeight="medium" className="text-muted-foreground text-[11px] mt-1">
            {done}/{total} completati
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

function PageRow({ page, first }: { page: NotePage; first: boolean }) {
  const updated = formatDayLabel(localIsoDate(new Date(page.updatedAt)));
  return (
    <Pressable
      onPress={() => openPage(page)}
      className={`flex-row items-center px-4 py-3.5 ${first ? "" : "border-t border-line"}`}
      style={{ gap: 12 }}
    >
      <IconTile name={page.icon} size={42} tone="neutral" />
      <View className="flex-1">
        <AppText fontWeight="bold" className="text-ink text-[15px]" numberOfLines={1}>
          {page.title || "Senza titolo"}
        </AppText>
        <AppText className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
          {pagePreview(page) || "Vuota"}
        </AppText>
      </View>
      <AppText className="text-muted-foreground text-[11px]">{updated}</AppText>
    </Pressable>
  );
}
