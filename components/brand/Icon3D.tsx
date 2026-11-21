import { Image } from "expo-image";
import { StyleProp, ImageStyle, View, ViewStyle } from "react-native";
import { ICONS3D, type Icon3DName } from "@/lib/brand";
import { colors } from "@/lib/constants";

interface Icon3DProps {
  name: Icon3DName;
  size?: number;
  /** Dims the icon (used for inactive tab bar items). */
  muted?: boolean;
  style?: StyleProp<ImageStyle>;
}

/** Premium 3D icon (3dicons, CC0) rendered in Gexar orange. */
export function Icon3D({ name, size = 32, muted = false, style }: Icon3DProps) {
  return (
    <Image
      source={ICONS3D[name]}
      contentFit="contain"
      style={[{ width: size, height: size, opacity: muted ? 0.38 : 1 }, style]}
    />
  );
}

/** 3D icon sitting on a soft rounded tile, for cards and list rows. */
export function IconTile({
  name,
  size = 44,
  tone = "primary",
  style,
}: {
  name: Icon3DName;
  size?: number;
  tone?: "primary" | "accent" | "neutral";
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    tone === "accent"
      ? colors["accent-soft"]
      : tone === "neutral"
        ? colors.canvas
        : colors["primary-soft"];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon3D name={name} size={size * 0.78} />
    </View>
  );
}
