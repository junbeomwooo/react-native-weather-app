import { ThemeContext } from "@/context/ThemeContext";
import { Link, usePathname } from "expo-router";
import { useContext } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CustomHeader({ title }: { title?: string }) {
  const { theme } = useContext(ThemeContext);

  const textColor = theme === "light" ? "text-black" : "text-white";
  const iconColor = theme === "light" ? "black" : "white";

  const pathname = usePathname();

  return (
    <SafeAreaView
      className="flex-row justify-between items-center"
      style={{
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: -10,
      }}
    >
      {pathname === "/" ? (
        <Ionicons name="menu-outline" size={28} color={iconColor} />
      ) : (
        <Link href="/">
          <Ionicons
            name="chevron-back-circle-outline"
            size={28}
            color={iconColor}
          />
        </Link>
      )}
      <Text
        className={`text-center font-medium ${textColor}`}
        style={{ fontSize: 18 }}
      >
        {title}
      </Text>
      {pathname === "/" ? (
        <Link href="/city">
          <Ionicons name="compass-outline" size={28} color={iconColor} />
        </Link>
      ) : (
        <AntDesign name="edit" size={25} color={iconColor} />
      )}
    </SafeAreaView>
  );
}
