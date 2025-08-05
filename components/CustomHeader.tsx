import { ListContext } from "@/context/EditContext";
import { ThemeContext } from "@/context/ThemeContext";
import { usePathname, useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

import { StatusBar } from "expo-status-bar";

export default function CustomHeader({ title }: { title?: string }) {
  /** Global context state */
  const { theme } = useContext(ThemeContext);
  const listContext = useContext(ListContext);
  if (!listContext)
    throw new Error("EditContext must be used within EditProvider");
  const { isEditOpen, setIsEditOpen, textInputPressIn } = listContext;

  const textColor = theme === "light" ? "text-black" : "text-white";
  const iconColor = theme === "light" ? "black" : "white";

  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView
      className={`${theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"}`}
      style={{
        paddingTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: -15,
      }}
    >
      <View
        className={`flex-row justify-between items-center ${textInputPressIn && "hidden"}`}
      >
        {/* left */}
        {pathname === "/" ? (
          <Pressable hitSlop={5}>
            <Ionicons name="menu-outline" size={28} color={iconColor} />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/")} hitSlop={5}>
            <Ionicons
              name="chevron-back-circle-outline"
              size={28}
              color={iconColor}
              className={`${isEditOpen ? "hidden" : ""}`}
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
          <Pressable hitSlop={5} onPress={() => router.push("/list")}>
            <Ionicons name="compass-outline" size={28} color={iconColor} />
          </Pressable>
        ) : isEditOpen ? (
          <Pressable hitSlop={5} onPress={() => setIsEditOpen(false)}>
            <Text
              className={`text-lg font-medium mr-2 py-[1.6px] ${theme === "light" ? "text-black" : "text-white"}`}
            >
              Done
            </Text>
          </Pressable>
        ) : (
          <Pressable hitSlop={5} onPress={() => setIsEditOpen(true)}>
            <AntDesign name="edit" size={28} color={iconColor} />
          </Pressable>
        )}
      </View>

      <StatusBar style={theme === "light" ? "dark" : "light"} />
    </SafeAreaView>
  );
}
