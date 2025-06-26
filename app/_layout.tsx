import CustomHeader from "@/components/CustomHeader";
import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
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
          header: (props) =>  <CustomHeader title={props.options.title} />,
        }}
      >
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
