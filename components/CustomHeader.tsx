import { ThemeContext } from "@/context/ThemeContext";
import { Link, usePathname, useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

import { StatusBar } from "expo-status-bar";

export default function CustomHeader({ title }: { title?: string }) {
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "light" ? "text-black" : "text-white";
  const iconColor = theme === "light" ? "black" : "white";

  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView
      className={`flex-row justify-between items-center ${
        theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"
      }`}
      style={{
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: -10,
      }}
    >
      {/* left */}
      {pathname === "/" ? (
        <Ionicons name="menu-outline" size={28} color={iconColor} />
      ) : (
        <Pressable onPress={() => router.push("/")} hitSlop={5}>
          <Ionicons
            name="chevron-back-circle-outline"
            size={28}
            color={iconColor}
          />
        </Pressable>
      )}

      {/* center */}
      <Text
        className={`text-center font-medium ${textColor}`}
        style={{ fontSize: 18 }}
      >
        {title}
      </Text>

      {/* right */}
      {pathname === "/" ? (
        <Link href="/list">
          <Ionicons name="compass-outline" size={28} color={iconColor} />
        </Link>
      ) : (
        <AntDesign name="edit" size={25} color={iconColor} />
      )}

      <StatusBar style={theme === "light" ? "dark" : "light"} />
    </SafeAreaView>
  );
}
