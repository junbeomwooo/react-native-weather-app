import { Alert, Dimensions, ScrollView, Text, View } from "react-native";

import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function Index() {
  const WINDOW_WIDTH = Dimensions.get("window").width;

  const [location, setLocation] = useState<any>(null);

  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

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

      let {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: 5 });

      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setLocation({ country: address[0]?.country, city: address[0]?.city });

      const [current, daily] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
        ),
      ]);

      const [currentWeather, dailyWeather] = await Promise.all([
        current.json(),
        daily.json(),
      ]);

      console.log(
        `currentWeather:${JSON.stringify(currentWeather)}, dailyWeather:${JSON.stringify(dailyWeather)} `
      );
    }

    getCurrentLocation();
  }, [WEATHER_API_KEY]);

  return (
    <View className="flex-1">
      <View className="flex-1 bg-[#FE6346] justify-center items-center">
        <Text style={{ fontSize: 45 }} className="font-semibold">
          {location?.city || "London"}
        </Text>
      </View>
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        className="bg-[#FE6346] flex-1"
        contentContainerStyle={{
          justifyContent: "center",
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
