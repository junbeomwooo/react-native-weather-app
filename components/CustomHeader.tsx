import { ThemeContext } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomHeader({ title }: { title?: string }) {
  const theme = useContext(ThemeContext);

  const textColor = theme === "light" ? "text-black" : "text-white";
  const iconColor = theme === "light" ? "black" : "white";

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
      <Ionicons name="menu-outline" size={26} color={iconColor} />
      <Text
        className={`text-center font-medium ${textColor}`}
        style={{ fontSize: 18 }}
      >
        {title}
      </Text>
      <Ionicons name="menu-outline" size={26} color={iconColor} />
    </SafeAreaView>
  );
}