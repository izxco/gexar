import { useCallback, useMemo } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { HeaderPill, ModuleHeader } from "@/components/brand/ModuleHeader";
import { Icon3D } from "@/components/brand/Icon3D";
import { colors } from "@/lib/constants";
import * as Sharing from "expo-sharing";
import { Toast } from "toastify-react-native";
import { AppText } from "@/components/AppText";
import { BarChart, type BarDatum } from "@/components/profile/BarChart";
import { DashboardCard } from "@/components/profile/DashboardCard";
import { LineChart } from "@/components/profile/LineChart";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { formatVolume } from "@/lib/format";
import { Cache } from "@/lib/cache";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkouts } from "@/providers/WorkoutsProvider";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEK_LABELS = ["", "", "", "", "", ""];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { items: workouts } = useWorkouts();

  const handleSettings = useCallback(() => {
    Alert.alert("Gexar Pocket", "Versione 1.0.0 · offline-first", [
      { text: "Chiudi", style: "cancel" },
      { text: "Ripristina Profilo", style: "destructive", onPress: () => signOut() },
    ]);
  }, [signOut]);

  const handleExportBackup = useCallback(async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Attenzione", "La condivisione non è supportata su questo dispositivo.");
        return;
      }
      const filePath = await Cache.exportBackup();
      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Esporta backup Gexar",
        UTI: "public.json",
      });
      Toast.success("Backup pronto!");
    } catch (e) {
      console.error(e);
      Alert.alert("Errore", "Impossibile completare l'esportazione.");
    }
  }, []);

  const workoutsPerWeek = useMemo<BarDatum[]>(() => {
    const now = Date.now();
    const buckets = new Array(6).fill(0);
    for (const workout of workouts) {
      const diff = now - new Date(workout.startedAt).getTime();
      const weeksAgo = Math.floor(diff / WEEK_MS);
      if (weeksAgo >= 0 && weeksAgo < 6) {
        buckets[5 - weeksAgo] += 1;
      }
    }
    return buckets.map((value, index) => ({
      label: WEEK_LABELS[index],
      value,
    }));
  }, [workouts]);

  const volumeTrend = useMemo(() => {
    const recent = [...workouts]
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      )
      .slice(-8)
      .map((w) => w.totalVolume);
    return recent.length >= 2 ? recent : null;
  }, [workouts]);

  const maxVolume = volumeTrend ? Math.max(...volumeTrend) : 0;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ModuleHeader
          module="pocket"
          title="Il tuo"
          accent="profilo"
          right={
            <>
              <Pressable hitSlop={8} onPress={handleSettings}>
                <Ionicons name="settings-outline" size={22} color={colors.ink} />
              </Pressable>
              <HeaderPill label="Home" onPress={() => router.navigate("/")} />
            </>
          }
        />
        <View className="px-5">
        <ProfileHeader
          name={user?.fullName ?? "Atleta Gexar"}
          workoutCount={workouts.length}
        />

        <View className="flex-row items-center justify-between mt-7 mb-1">
          <AppText variant="serif" className="text-ink text-[28px]">
            Progressi
          </AppText>
        </View>

        <View className="mt-3">
          <DashboardCard
            title="Volume Totale"
            subtitle="Per Allenamento"
            rightLabels={
              volumeTrend
                ? [formatVolume(maxVolume), formatVolume(maxVolume / 2)]
                : undefined
            }
          >
            {volumeTrend ? (
              <LineChart data={volumeTrend} />
            ) : (
              <View className="h-[120px] items-center justify-center">
                <AppText className="text-gray-400 text-sm">
                  Nessun dato sufficiente al momento
                </AppText>
              </View>
            )}
          </DashboardCard>
        </View>

        <View className="mt-4">
          <DashboardCard
            title="Allenamenti a Settimana"
            subtitle="Attività"
            accentIcon="disc-outline"
            rightLabels={[
              `${Math.max(1, ...workoutsPerWeek.map((d) => d.value))}`,
              "0",
            ]}
          >
            <BarChart data={workoutsPerWeek} />
          </DashboardCard>
        </View>

        {/* Sezione Backup & Privacy Dati */}
        <View className="mt-6 bg-surface border border-line rounded-3xl p-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-2">
              <Icon3D name="shield" size={30} />
              <AppText className="text-ink text-base" fontWeight="bold">
                Backup & Privacy Dati
              </AppText>
            </View>
            <View className="bg-primary/10 rounded-full px-2 py-0.5">
              <AppText className="text-primary text-[10px]" fontWeight="bold">
                OFFLINE
              </AppText>
            </View>
          </View>
          <AppText className="text-muted-foreground text-xs mb-3">
            Allenamenti, pasti, movimenti e note restano solo su questo telefono. Puoi esportarli in un file JSON in qualsiasi momento.
          </AppText>
          <Pressable
            onPress={handleExportBackup}
            className="flex-row items-center justify-center bg-primary rounded-2xl py-3 px-4 gap-2"
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <AppText className="text-white text-sm" fontWeight="bold">
              Esporta Tutti i Dati (File JSON)
            </AppText>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
