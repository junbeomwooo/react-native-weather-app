import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";

import { useNavigation } from "expo-router";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemeContext } from "./_layout";

export default function Index() {
  const theme = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;

  const [location, setLocation] = useState<any>(null);
  const [dailyWeather, setDailyWeather] = useState([]);

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

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setLocation({ country: address[0]?.country, city: address[0]?.city });

      const [current, daily] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
      ]);

      const [currentWeather, dailyWeather] = await Promise.all([
        current.json(),
        daily.json(),
      ]);

      // console.log(`${JSON.stringify(dailyWeather)}`)

      setDailyWeather(
        dailyWeather?.list?.filter((v: any) => {
          if (v?.dt_txt?.includes("12:00:00")) {
            return v;
          }
        })
      );
    }
    getCurrentLocation();
  }, [WEATHER_API_KEY]);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: location?.city });
  }, [navigation, location?.city]);

  return (
    <ScrollView
      className="flex-1"
      horizontal={true}
      pagingEnabled={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {dailyWeather?.length > 0 ? (
        dailyWeather?.map((v: any, i) => {
          const date = new Date(v?.dt_txt);

          const weekday = date?.toLocaleDateString("en-GB", {
            weekday: "long",
          });
          const dateMonth = date?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
          });

          const textColor = theme === "light" ? "text-black" : "text-white";
          const borderColor = theme === "light" ? "border-black" : "border-white";
          const iconColor = theme === "light" ? "black" : "white";

          return (
            <View key={i} className="flex-1" style={{ width: WINDOW_WIDTH }}>
              {/* Date */}
              <View className="flex-[1] justify-center gap-1 px-[30px]">
                <Text
                  className={`font-semibold text-[25px] ${textColor}`}
                >
                  {weekday}
                </Text>
                <Text
                  className={`text-[15px]  ${textColor}`}
                >
                  {dateMonth}
                </Text>
              </View>
              {/* hr */}
              <View
                className={`border-b-[1.3px] ${borderColor} m-auto`}
                style={{ width: WINDOW_WIDTH - 60 }}
              />
              {/* Degree */}
              <View className="flex-[2] justify-center m-auto">
                <Text
                  className={`font-semibold text-[128px]  ${textColor}`}
                >
                  {v?.main?.temp?.toFixed(0)}°
                </Text>
                <Text
                  className={`font-medium text-[30px] mt-[-15px]  ${textColor}`}
                >
                  {v?.weather[0]?.main}
                </Text>
              </View>
              {/* hr 2 */}
              <View
                className={`border-b-[1.3px]  ${borderColor} m-auto`}
                style={{ width: WINDOW_WIDTH - 60 }}
              />
              {/* Conditions */}
              <View className="flex-[1.4] px-[30px] justify-center gap-6">
                {/* feels like, pop */}
                <View className="flex-row justify-between">
                  {/* feels like */}
                  <View className="flex-row items-center gap-2">
                    <FontAwesome5
                      name={
                        v?.main?.feels_like > 20
                          ? `temperature-high`
                          : `temperature-low`
                      }
                      size={18}
                      color={iconColor}
                    />
                    <Text className={`text-[18px] font-semibold ${textColor}`}>
                      {v?.main?.feels_like}°C
                    </Text>
                  </View>

                  {/* pop */}
                  <View className="flex-row items-center gap-2">
                    <Fontisto
                      name="rain"
                      size={18}
                      className="font-bold"
                      color={iconColor}
                    />
                    <View className="flex-row justify-between">
                      <Text className={`text-[18px] font-semibold ${textColor}`}>
                        {v?.pop * 100}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* humidity, wind */}
                <View className="flex-row justify-between">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="water-outline"
                      size={24}
                      color={iconColor}
                      className="ml-[-6px]"
                    />
                    <Text className={`text-[18px] font-semibold ${textColor}`}>
                      {v?.main?.humidity}%
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <FontAwesome5 name="wind" size={18} color={iconColor} />
                    <Text className={`text-[18px] font-semibold ${textColor}`}>
                      {v?.wind?.speed}m/s
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View
          className="flex-1 justify-center items-center"
          style={{ width: WINDOW_WIDTH }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </ScrollView>
  );
}
