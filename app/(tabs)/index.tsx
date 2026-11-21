import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Icon3D, IconTile } from "@/components/brand/Icon3D";
import { Logo } from "@/components/brand/Logo";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import { MODULES, type Icon3DName, type ModuleName } from "@/lib/brand";
import { colors, dailyGoals } from "@/lib/constants";
import { formatEuro, localIsoDate, monthKey } from "@/lib/dates";
import { useAuth } from "@/providers/AuthProvider";
import { getEntryTotals, useDiary, type FoodEntry } from "@/providers/DiaryProvider";
import { useFinance } from "@/providers/FinanceProvider";
import { useNotes } from "@/providers/NotesProvider";
import { useWorkouts } from "@/providers/WorkoutsProvider";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const { items: workouts } = useWorkouts();
  const { selectedDate, totals, entries } = useDiary();
  const { summaryFor, totalBalance } = useFinance();
  const { pages } = useNotes();

  const firstName = (user.fullName ?? "Atleta").split(" ")[0];

  const workoutsThisWeek = useMemo(
    () => workouts.filter((w) => Date.now() - new Date(w.startedAt).getTime() < WEEK_MS).length,
    [workouts]
  );

  // The diary keys days by UTC date (see DiaryProvider); stay consistent with it.
  const todayKcal = useMemo(() => {
    const diaryToday = new Date().toISOString().slice(0, 10);
    if (selectedDate === diaryToday) return totals.calories;
    const list = Cache.get<FoodEntry[]>(`${CACHE_KEYS.FOOD_ENTRIES_PREFIX}:${diaryToday}`) ?? [];
    return list.reduce((acc, e) => acc + getEntryTotals(e).calories, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, totals.calories, entries]);

  const month = summaryFor(monthKey(localIsoDate()));
  const openTodos = useMemo(
    () => pages.reduce((acc, p) => acc + p.blocks.filter((b) => b.type === "todo" && !b.checked).length, 0),
    [pages]
  );

  const kcalPct = Math.min(todayKcal / dailyGoals.calories, 1);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-primary rounded-b-[36px] px-5 pb-7" style={{ paddingTop: top + 10 }}>
          <View className="flex-row items-center justify-between">
            <Logo name="pocket" width={92} color="#FFFFFF" />
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/profile")}
              className="rounded-full items-center justify-center"
              style={{ width: 44, height: 44, backgroundColor: "rgba(255,255,255,0.16)" }}
              accessibilityLabel="Profilo"
            >
              <Ionicons name="person" size={20} color="#fff" />
            </Pressable>
          </View>
          <AppText variant="serif" className="text-white text-[42px] leading-[46px] mt-6">
            {greeting()},{"\n"}
            <AppText variant="serif-italic" className="text-white">
              {firstName}
            </AppText>
          </AppText>
          <AppText className="text-white/75 text-sm mt-2">
            Allenamento, alimentazione, soldi e idee. Tutto in tasca.
          </AppText>
        </View>

        <View className="px-5 -mt-5" style={{ gap: 12 }}>
          {/* Quick actions */}
          <View
            className="bg-surface rounded-3xl flex-row py-4 px-2"
            style={{
              shadowColor: colors.ink,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 18,
              elevation: 6,
            }}
          >
            <QuickAction icon="flash" label="Allenati" href="/active-workout" />
            <QuickAction icon="camera" label="Scansiona" href="/barcode-scan" />
            <QuickAction icon="euro" label="Movimento" href="/add-transaction" />
            <QuickAction icon="pencil" label="Nota" href="/notes" />
          </View>

          <AppText variant="serif" className="text-ink text-[30px] mt-3">
            Le tue{" "}
            <AppText variant="serif-italic" className="text-primary">
              funzioni
            </AppText>
          </AppText>

          <View className="flex-row" style={{ gap: 12 }}>
            <ModuleCard
              module="fitness"
              href="/workout"
              value={`${workoutsThisWeek}`}
              caption={workoutsThisWeek === 1 ? "allenamento in 7 giorni" : "allenamenti in 7 giorni"}
            />
            <ModuleCard
              module="nutrition"
              href="/nutrition"
              value={`${Math.round(todayKcal)}`}
              caption={`di ${dailyGoals.calories} kcal oggi`}
              progress={kcalPct}
            />
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            <ModuleCard
              module="finance"
              href="/finance"
              value={formatEuro(totalBalance)}
              caption={`${formatEuro(month.expense)} spesi questo mese`}
            />
            <ModuleCard
              module="notes"
              href="/notes"
              value={`${pages.length}`}
              caption={openTodos > 0 ? `pagine · ${openTodos} da fare` : "pagine"}
            />
          </View>

          {/* Privacy */}
          <Pressable
            onPress={() => router.push("/profile")}
            className="bg-ink rounded-3xl p-5 flex-row items-center mt-2"
            style={{ gap: 14 }}
          >
            <Icon3D name="shield" size={54} />
            <View className="flex-1">
              <AppText fontWeight="bold" className="text-white text-[15px]">
                I tuoi dati restano tuoi
              </AppText>
              <AppText className="text-white/60 text-xs mt-1">
                Tutto è salvato solo su questo telefono. Esporta un backup dal profilo.
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ffffff80" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, href }: { icon: Icon3DName; label: string; href: Href }) {
  return (
    <Pressable onPress={() => router.push(href)} className="flex-1 items-center">
      <IconTile name={icon} size={50} />
      <AppText fontWeight="medium" className="text-ink text-xs mt-2">
        {label}
      </AppText>
    </Pressable>
  );
}

function ModuleCard({
  module,
  href,
  value,
  caption,
  progress,
}: {
  module: ModuleName;
  href: Href;
  value: string;
  caption: string;
  progress?: number;
}) {
  const m = MODULES[module];
  return (
    <Pressable
      onPress={() => router.navigate(href)}
      className="flex-1 bg-surface rounded-3xl p-4 border border-line"
      style={{ minHeight: 172 }}
    >
      <View className="flex-row items-start justify-between">
        <Logo name={m.logo} width={56} color={m.tint} />
        <Icon3D name={m.icon} size={46} style={{ marginTop: -4, marginRight: -4 }} />
      </View>
      <View className="flex-1 justify-end">
        <AppText variant="serif" className="text-ink text-[30px] leading-[34px]" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </AppText>
        <AppText className="text-muted-foreground text-xs mt-0.5" numberOfLines={2}>
          {caption}
        </AppText>
        {progress != null && (
          <View className="h-1.5 bg-track-gray rounded-full mt-2 overflow-hidden">
            <View className="h-full bg-primary rounded-full" style={{ width: `${progress * 100}%` }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
