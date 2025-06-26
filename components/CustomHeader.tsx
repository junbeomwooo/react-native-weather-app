import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomHeader({ title }: { title?: string }) {
  return (
    <SafeAreaView
      className="bg-yellow-300 flex-row justify-between items-center"
      style={{
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: -10,
      }}
    >
      <Ionicons name="menu-outline" size={26} color="black" />
      <Text className="text-center font-medium" style={{ fontSize: 18 }}>
        {title}
      </Text>
      <Ionicons name="menu-outline" size={26} color="black" />
    </SafeAreaView>
  );
}
