import { Alert, Dimensions, ScrollView, Text, View } from "react-native";

import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function Index() {
  const WINDOW_WIDTH = Dimensions.get("window").width;

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const permissionDenied = (title: string, msg: string) =>
    Alert.alert(title, msg, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status !== "granted") {
        permissionDenied(
          "Permission Denied",
          "Permission to access location was denied"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  console.log(location);

  return (
    <View className="flex-1">
      <View className="flex-1 bg-orange-500 justify-center items-center">
        <Text style={{ fontSize: 45 }} className="font-semibold">
          Copenhagen
        </Text>
      </View>
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        className="bg-[#FE6346] flex-1"
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <Text className="text-center font-semibold" style={{ fontSize: 128 }}>
            27
          </Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium text-center"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <Text className="text-center font-semibold" style={{ fontSize: 128 }}>
            28
          </Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium text-center"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <Text className="text-center font-semibold" style={{ fontSize: 128 }}>
            29
          </Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium text-center"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <Text className="text-center font-semibold" style={{ fontSize: 128 }}>
            30
          </Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium text-center"
          >
            Windy
          </Text>
        </View>
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <Text className="text-center font-semibold" style={{ fontSize: 128 }}>
            31
          </Text>
          <Text
            style={{ fontSize: 45, marginTop: -15 }}
            className="font-medium text-center"
          >
            Windy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
