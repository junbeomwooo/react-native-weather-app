import CustomHeader from "@/components/CustomHeader";
import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("light");

export default function RootLayout() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const nowHour = new Date()?.getHours();

    if (nowHour > 20) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      <SafeAreaProvider>
        {/* <Stack
        screenOptions={{
          headerRight: () => (
            <Pressable>
              <Entypo name="menu" size={24} color="black" />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable>
              <Entypo name="menu" size={24} color="black" />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      > */}

        <Stack
          screenOptions={{
            header: (props) => <CustomHeader title={props.options.title} />,
            contentStyle: {
              backgroundColor: theme === "light" ? "#fed500" : "#080830",
            },
          }}
        >
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={theme === "light" ? "dark" : "light"} />
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}
