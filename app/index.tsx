import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <ScrollView
      style={{paddingTop:200}}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Text className="text-xl">Hello</Text>
        <TextInput style={{ width: 200, height: 30, borderWidth: 1 }} />
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          className="w-12 h-12"
        />
        <StatusBar />
      </View>
    </ScrollView>
  );
}
