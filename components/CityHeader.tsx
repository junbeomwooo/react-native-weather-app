import { useRouter } from "expo-router";

import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CityHeader({
  isNight,
  title,
}: {
  isNight?: boolean;
  title: string;
}) {
  const textColor = !isNight ? "text-black" : "text-white";
  const iconColor = !isNight ? "black" : "white";

  const router = useRouter();

  return (
    <SafeAreaView
      className={`flex-row justify-between items-center ${
        !isNight ? "bg-[#fed500]" : "bg-[#080830]"
      }`}
      style={{
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: -10,
      }}
    >
      {/* left */}

      <Pressable onPress={() => router.push("/")} hitSlop={5}>
        <Ionicons name="chevron-back-sharp" size={24} color={iconColor} />
      </Pressable>

      {/* center */}
      <Text
        className={`text-center font-medium ${textColor}`}
        style={{ fontSize: 18 }}
      >
        {title}
      </Text>

      {/* right */}

      <AntDesign name="plus" size={25} color={iconColor} />
    </SafeAreaView>
  );
}
