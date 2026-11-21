import { Tabs } from "expo-router";
import { GexarTabBar } from "@/components/brand/GexarTabBar";

/**
 * Navigation map
 *   Home        → index      (hub di tutte le funzioni; profilo dal tasto in alto)
 *   Fitness     → workout    (+ history, exercises via segmented control)
 *   Nutrizione  → nutrition
 *   Finance     → finance
 *   Notes       → notes
 * Hidden routes (history, exercises, profile) keep the tab bar visible and
 * highlight their parent tab — see GexarTabBar.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GexarTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: "shift" }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="workout" options={{ title: "Fitness" }} />
      <Tabs.Screen name="nutrition" options={{ title: "Nutrizione" }} />
      <Tabs.Screen name="finance" options={{ title: "Finance" }} />
      <Tabs.Screen name="notes" options={{ title: "Notes" }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
