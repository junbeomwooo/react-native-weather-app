import CustomHeader from "@/components/CustomHeader";

import { ListProvider } from "@/context/EditContext";
import { LocationProvider } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";

import "@/global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  /** Global Theme context value */
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sunset, setSunset] = useState<number | null>(null);
  const [sunrise, setSunrise] = useState<number | null>(null);

  useEffect(() => {
    if (!sunrise || !sunset) return;

    // Currnet hour
    const nowHour = new Date()?.getHours();

    console.log(
      ` sunrise: ${sunrise} , sunset: ${sunset} , nowHours: ${nowHour}`
    );

    // when its after sunset || its before sunrise
    if (nowHour >= sunset || nowHour < sunrise) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [sunrise, sunset]);

  /** 
    none,
    fade,
    fade_from_bottom,
    slide_from_bottom,
    slide_from_right,
    slide_from_left,
    simple_push,
    flip,
    default
  */

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider
        value={{
          theme: theme,
          sunrise: sunrise,
          sunset: sunset,
          setSunrise: setSunrise,
          setSunset: setSunset,
        }}
      >
        <ListProvider>
          <LocationProvider>
            {/* Custom header */}
            <Stack
              screenOptions={{
                header: (props) => {
                  return <CustomHeader title={props.options.title} />;
                },
              }}
            >
              {/* List */}
              <Stack.Screen name="list" />

              {/* City page */}
              <Stack.Screen
                name="city/[cityID]"
                options={{ headerShown: false }}
              />

              {/* Map */}
              <Stack.Screen
                name="map"
                options={{ headerShown: false, animation: "fade" }}
              />

              {/* Not found */}
              <Stack.Screen name="+not-found" />
            </Stack>
          </LocationProvider>
        </ListProvider>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
