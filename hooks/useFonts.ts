import { useFonts as useExpoFonts } from "expo-font";
import { fonts } from "@/lib/constants";

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    [fonts.regular]: require("../assets/fonts/Now-Regular.otf"),
    [fonts.medium]: require("../assets/fonts/Now-Medium.otf"),
    [fonts.bold]: require("../assets/fonts/Now-Bold.otf"),
    [fonts.serif]: require("../assets/fonts/InstrumentSerif-Regular.ttf"),
    [fonts.serifItalic]: require("../assets/fonts/InstrumentSerif-Italic.ttf"),
  });

  return { fontsLoaded, fontError };
}
