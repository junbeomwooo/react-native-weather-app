import { ThemeContext } from "@/context/ThemeContext";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Image } from "expo-image";
import * as Location from "expo-location";
import { Fragment, useContext, useEffect, useState } from "react";

import { useNavigation } from "expo-router";

import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function Index() {
  const theme = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const [location, setLocation] = useState<any>(null);

  const [currentWeather, setCurrentWeather] = useState<any>({});
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

      setCurrentWeather(currentWeather);

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

  /** weahter code list */

  const storm = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232];

  const drizzle = [300, 301, 302, 310, 311, 312, 313, 314, 321];

  const rain = [500, 501, 502, 503, 504, 520, 521, 522, 531];

  const snow = [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622, 511];

  const mist = [701, 711, 721, 731, 741, 751, 761, 762, 771, 781];

  const clear = [800];

  const fewClouds = [801, 802];

  const clouds = [803, 804];

  // Get Weather Icons based on weather code
  const getWeatherIcons = (weatherId: number, size: number) => {
    if (storm?.includes(weatherId)) {
      return (
        <Ionicons
          name="thunderstorm-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    } else if (drizzle?.includes(weatherId) || rain?.includes(weatherId)) {
      return (
        <Ionicons
          name="rainy-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    } else if (snow?.includes(weatherId)) {
      return (
        <Ionicons
          name="snow-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    } else if (mist?.includes(weatherId)) {
      return (
        <MaterialCommunityIcons
          name="weather-fog"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    } else if (clear?.includes(weatherId)) {
      const clear =
        theme === "light" ? (
          <Fontisto name="day-sunny" size={size} color="black" />
        ) : (
          <Ionicons name="moon-outline" size={size} color="white" />
        );
      return clear;
    } else if (fewClouds?.includes(weatherId)) {
      const fewClouds =
        theme === "light" ? (
          <Image
            source={require("../assets/images/day-cloudy.png")}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        ) : (
          <Ionicons name="cloudy-night-outline" size={size} color="white" />
        );

      return fewClouds;
    } else if (clouds?.includes(weatherId)) {
      return (
        <Ionicons
          name="cloud-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
          className="mb-[-20px]"
        />
      );
    }
  };

  // weatherID value
  const weatherId = currentWeather?.weather?.length
    ? currentWeather.weather[0].id
    : null;

  // weather main value
  const weatherMain = currentWeather?.weather?.length
    ? currentWeather.weather[0].main
    : null;

  return (
    <ScrollView
      className="flex-1 px-8"
      style={{ width: WINDOW_WIDTH }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {currentWeather ? (
        <Fragment>
          {/* Current weather */}
          <View className="justify-center mt-16">
            {/* Weather Icon */}
            <View className="w-[250px] h-[250px] items-center justify-center">
              {getWeatherIcons(weatherId ? weatherId : 0, 250)}
            </View>
            <Text
              className={`text-[140px] font-medium ${theme === "light" ? "text-black" : "text-white"}`}
            >
              {/* Current temp */}
              {Math.round(currentWeather?.main?.temp)}°
            </Text>

            {/* Weather description */}
            <Text
              className={`${theme === "light" ? "text-black" : "text-white"} text-[35px] font-medium`}
            >
              {weatherMain}
            </Text>

            {/* High temp, Low, temp */}
            <View className="flex-row gap-2 mt-3">
              <Text
                className={`${theme === "light" ? "text-black" : "text-white"} text-[20px] font-medium`}
              >
                H:{Math.round(currentWeather?.main?.temp_max)}°
              </Text>
              <Text
                className={`${theme === "light" ? "text-black" : "text-white"} text-[20px] font-medium`}
              >
                L:{Math.round(currentWeather?.main?.temp_min)}°
              </Text>
            </View>
          </View>

          {/* Hr */}
          <View className="w-full h-[1px] bg-white my-14" />
        </Fragment>
      ) : (
        /** Loading Bar (Indicator) */
        <View
          className="flex-1 justify-center items-center"
          style={{ width: WINDOW_WIDTH, height: WINDOW_HEIGHT - 200 }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </ScrollView>
  );
}
