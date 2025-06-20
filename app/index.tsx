import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <ScrollView
      style={{ paddingTop: 200 }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <Text className="text-2xl">Hello</Text>
        <TextInput style={{ width: 200, height: 30, borderWidth: 1 }} />
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          className="w-[100px] h-[100px]"
        />
        <StatusBar />

        <View className="mt-4">
          <Button
            color="#f194ff"
            title="Press me"
            onPress={() => {
              if (Platform.OS === "web") {
                window.alert("Hello, there");
              } else {
                Alert.alert("Hello, there");
              }
            }}
          />
        </View>

        <Pressable
          className="bg-blue-500 py-2 px-4 text-center mt-4"
          accessibilityLabel="Hello"
          onPress={() => {
            if (Platform.OS === "web") {
              window.alert("Hello, there");
            } else {
              Alert.alert("Hello, there");
            }
          }}
        >
          <Text className="text-center text-white font-medium">Hello</Text>
        </Pressable>
      </View>

       <SafeAreaProvider>
      <SafeAreaView className="flex-1 items-center justify-center mt-4">
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </SafeAreaView>
    </SafeAreaProvider>
    </ScrollView>
  );
}
