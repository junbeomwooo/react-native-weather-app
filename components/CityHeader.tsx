import { useRouter } from "expo-router";

import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { StatusBar } from "expo-status-bar";

export default function CityHeader({
  isNight,
  title,
  alearyExist,
  onClickSaveIntoAsync,
  DeleteStorageItem,
}: {
  isNight?: boolean;
  title: string;
  alearyExist: boolean;
  onClickSaveIntoAsync: () => void;
  DeleteStorageItem: () => void;
}) {
  const router = useRouter();

  const textColor = !isNight ? "text-black" : "text-white";
  const iconColor = !isNight ? "black" : "white";

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

      <Pressable onPress={() => router.push("/list")} hitSlop={5}>
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
      {alearyExist ? (
        <Pressable onPress={() => DeleteStorageItem()} hitSlop={5}>
          <MaterialIcons name="delete-outline" size={25} color={iconColor} />
        </Pressable>
      ) : (
        <Pressable onPress={() => onClickSaveIntoAsync()} hitSlop={5}>
          <AntDesign name="plus" size={25} color={iconColor} />
        </Pressable>
      )}
      <StatusBar style={isNight ? "light" : "dark"} />
    </SafeAreaView>
  );
}
