import CustomHeader from "@/components/CustomHeader";
import { ThemeContext } from "@/context/ThemeContext";
import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
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
        <Stack
          screenOptions={{
            header: (props) => {
              return <CustomHeader title={props.options.title} />;
            },
            // contentStyle: {
            //   backgroundColor: theme === "light" ? "#fed500" : "#080830",
            // },
          }}
        >
          <Stack.Screen name="list" />
          <Stack.Screen name="city/[cityName]" options={{ headerShown:false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={theme === "light" ? "dark" : "light"} />
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
