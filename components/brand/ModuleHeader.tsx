import { Pressable, View } from "react-native";
import { router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Logo } from "@/components/brand/Logo";
import { MODULES, type LogoName, type ModuleName } from "@/lib/brand";
import { colors } from "@/lib/constants";

interface ModuleHeaderProps {
  /** Which logo declination to show; `pocket` is the umbrella brand. */
  module: ModuleName | "pocket";
  /** Serif page title. */
  title: string;
  /** Optional italic accent appended to the title, in the module colour. */
  accent?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared top-of-page header: logo declination + Instrument Serif title. */
export function ModuleHeader({
  module,
  title,
  accent,
  subtitle,
  right,
  children,
}: ModuleHeaderProps) {
  const { top } = useSafeAreaInsets();
  const logo: LogoName = module === "pocket" ? "gexar" : MODULES[module].logo;
  const tint = module === "pocket" ? colors.primary : MODULES[module].tint;

  return (
    <View className="px-5 pb-3" style={{ paddingTop: top + 8 }}>
      <View className="flex-row items-center justify-between" style={{ minHeight: 36 }}>
        <Logo name={logo} width={module === "pocket" ? 72 : 64} color={tint} />
        {right != null && (
          <View className="flex-row items-center" style={{ gap: 10 }}>
            {right}
          </View>
        )}
      </View>
      <AppText variant="serif" className="text-ink text-[40px] leading-[46px] mt-3">
        {title}
        {accent ? (
          <AppText variant="serif-italic" style={{ color: tint }}>
            {" "}
            {accent}
          </AppText>
        ) : null}
      </AppText>
      {subtitle ? (
        <AppText className="text-muted-foreground text-sm mt-0.5">{subtitle}</AppText>
      ) : null}
      {children}
    </View>
  );
}

/** Round pill button used in headers. */
export function HeaderPill({
  label,
  onPress,
  icon,
  tone = "soft",
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: "soft" | "solid";
}) {
  const solid = tone === "solid";
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      className={`flex-row items-center rounded-full px-3.5 py-2 ${solid ? "bg-primary" : "bg-primary-soft"}`}
      style={{ gap: 6 }}
    >
      {icon}
      <AppText
        fontWeight="bold"
        className={`text-xs ${solid ? "text-white" : "text-primary"}`}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export interface SegmentItem {
  key: string;
  label: string;
  href: Href;
}

/** Pill segmented control linking sibling screens of one module. */
export function SegmentedNav({
  items,
  active,
}: {
  items: SegmentItem[];
  active: string;
}) {
  return (
    <View
      className="flex-row bg-surface rounded-full p-1 mt-4 border border-line"
      style={{ gap: 4 }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            key={item.key}
            onPress={() => !isActive && router.navigate(item.href)}
            className={`flex-1 items-center rounded-full py-2 ${isActive ? "bg-ink" : ""}`}
          >
            <AppText
              fontWeight={isActive ? "bold" : "medium"}
              className={`text-[13px] ${isActive ? "text-white" : "text-muted-foreground"}`}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export const FITNESS_SEGMENTS: SegmentItem[] = [
  { key: "workout", label: "Allenamento", href: "/workout" },
  { key: "history", label: "Storico", href: "/history" },
  { key: "exercises", label: "Esercizi", href: "/exercises" },
];
