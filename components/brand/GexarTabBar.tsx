import { Pressable, View } from "react-native";
import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Icon3D } from "@/components/brand/Icon3D";
import type { Icon3DName } from "@/lib/brand";
import { colors } from "@/lib/constants";

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

/** Visible tabs, in order. Other routes in (tabs) are reachable but hidden. */
export const MAIN_TABS: { route: string; label: string; icon: Icon3DName }[] = [
  { route: "index", label: "Home", icon: "star" },
  { route: "workout", label: "Fitness", icon: "gym" },
  { route: "nutrition", label: "Nutrizione", icon: "fire" },
  { route: "finance", label: "Finance", icon: "wallet" },
  { route: "notes", label: "Notes", icon: "notebook" },
];

/** Hidden routes highlight the tab of the section they belong to. */
const PARENT_TAB: Record<string, string> = {
  history: "workout",
  exercises: "workout",
  profile: "index",
};

export function GexarTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const current = state.routes[state.index]?.name ?? "index";
  const activeTab = PARENT_TAB[current] ?? current;

  return (
    <View
      className="bg-surface border-t border-line flex-row px-2 pt-2"
      style={{
        paddingBottom: Math.max(bottom, 10),
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      {MAIN_TABS.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.route);
        if (!route) return null;
        const focused = activeTab === tab.route;

        const isCurrent = current === tab.route;
        const onPress = () => {
          const event = emitter.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isCurrent && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable
            key={tab.route}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            className="flex-1 items-center"
          >
            <View
              className={`items-center justify-center rounded-2xl ${focused ? "bg-primary-soft" : ""}`}
              style={{ width: 52, height: 36 }}
            >
              <Icon3D name={tab.icon} size={focused ? 30 : 26} muted={!focused} />
            </View>
            <AppText
              fontWeight={focused ? "bold" : "medium"}
              className={`text-[10.5px] mt-1 ${focused ? "text-primary" : "text-muted-foreground"}`}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
