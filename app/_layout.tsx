import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { TemplatesProvider } from "../providers/TemplatesProvider";
import { WorkoutsProvider } from "../providers/WorkoutsProvider";
import { DiaryProvider } from "../providers/DiaryProvider";
import { TemplateDraftProvider } from "../providers/TemplateDraftProvider";
import { WorkoutSessionProvider } from "../providers/WorkoutSessionProvider";
import ToastManager from "toastify-react-native";
import { useFonts } from "../hooks/useFonts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigator() {
  const { status } = useAuth();
  const { fontsLoaded, fontError } = useFonts();

  const isReady = (fontsLoaded || fontError) && status !== "loading";

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ title: "" }} />
      <Stack.Screen
        name="create-template"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="select-exercises"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="active-workout"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="barcode-scan"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="log-food"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="edit-entry"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TemplatesProvider>
            <WorkoutsProvider>
              <DiaryProvider>
                <TemplateDraftProvider>
                  <WorkoutSessionProvider>
                    <BottomSheetModalProvider>
                      <RootNavigator />
                      <ToastManager
                        position="top"
                        duration={4000}
                        showProgressBar={false}
                        useModal={false}
                      />
                    </BottomSheetModalProvider>
                  </WorkoutSessionProvider>
                </TemplateDraftProvider>
              </DiaryProvider>
            </WorkoutsProvider>
          </TemplatesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
