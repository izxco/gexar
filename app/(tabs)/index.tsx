import { useCallback, useMemo } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { items: workouts } = useWorkouts();

  const handleSettings = useCallback(() => {
    Alert.alert("GEXAR FIT", "Versione 1.0.0 (Offline-First Edition)", [
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
        dialogTitle: "Esporta Backup GEXAR FIT",
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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Pressable hitSlop={8} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={22} color="#016F47" />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={handleExportBackup}
          className="flex-row items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1"
        >
          <Ionicons name="share-outline" size={16} color="#016F47" />
          <AppText className="text-primary text-xs" fontWeight="bold">
            Backup
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText className="text-gray-900 text-4xl mt-1 mb-5" fontWeight="bold">
          Profilo
        </AppText>

        <ProfileHeader
          name={user?.fullName ?? "Atleta GEXAR"}
          workoutCount={workouts.length}
        />

        <View className="flex-row items-center justify-between mt-7 mb-1">
          <AppText className="text-gray-900 text-xl" fontWeight="bold">
            Dashboard
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
        <View className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="shield-checkmark" size={18} color="#016F47" />
              <AppText className="text-gray-900 text-base" fontWeight="bold">
                Backup & Privacy Dati
              </AppText>
            </View>
            <View className="bg-primary/10 rounded-full px-2 py-0.5">
              <AppText className="text-primary text-[10px]" fontWeight="bold">
                OFFLINE
              </AppText>
            </View>
          </View>
          <AppText className="text-gray-500 text-xs mb-3">
            Tutti i tuoi allenamenti, massimali e pasti restano solo su questo telefono. Puoi esportarli o salvarli su iCloud in qualsiasi momento.
          </AppText>
          <Pressable
            onPress={handleExportBackup}
            className="flex-row items-center justify-center bg-primary rounded-xl py-3 px-4 gap-2"
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <AppText className="text-white text-sm" fontWeight="bold">
              Esporta Tutti i Dati (File JSON)
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
