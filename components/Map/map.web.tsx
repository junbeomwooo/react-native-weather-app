import { ThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Map() {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      className={`${theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"}`}
    >
      <Text className={`${theme === "light" ? "text-black" : "text-white"}`}>
        Map is not available on web
      </Text>
      <Pressable className="bg-white p-3 rounded-xl mt-4" hitSlop={5} onPress={()=>router.push("/")}>
        <Text>Go back</Text>
      </Pressable>
    </View>
  );
}
