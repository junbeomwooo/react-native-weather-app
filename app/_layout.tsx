import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>공통헤더이다</Text>
      </SafeAreaView>
      <Stack />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
