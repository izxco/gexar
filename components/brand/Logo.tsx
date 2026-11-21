import { Image } from "expo-image";
import { StyleProp, ImageStyle } from "react-native";
import { LOGOS, type LogoName } from "@/lib/brand";
import { colors } from "@/lib/constants";

interface LogoProps {
  name?: LogoName;
  /** Rendered width in points; height follows the logo's aspect ratio. */
  width?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/** Gexar wordmark and its per-function declinations (Fitness, Finance…). */
export function Logo({
  name = "gexar",
  width = 96,
  color = colors.primary,
  style,
}: LogoProps) {
  const logo = LOGOS[name];
  return (
    <Image
      source={logo.source}
      tintColor={color}
      contentFit="contain"
      style={[{ width, height: width / logo.ratio }, style]}
      accessibilityLabel={`Gexar ${name === "gexar" ? "" : name}`.trim()}
    />
  );
}
