import { LocationContext } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { Fragment, useContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";

import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  getCurrentWeatherIcons,
  getWeatherIconsByTime,
} from "@/hooks/getWeatherIcons";

import getLocalDayTime from "@/hooks/getLocalDayTime";

export interface CurrnetWeatherData {
  base: string;
  clouds: { all: number };
  cod: number;
  coord: { lat: number; lon: number };
  dt: number;
  id: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
    id: number;
    sunrise: number;
    sunset: number;
    type: number;
  };
  timezone: number;
  visibility: number;
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[];
  wind: { deg: number; speed: number };
}

export interface DailyHourlyWeatherData {
  clouds: { all: number };
  dt: number;
  dt_txt: string;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_kf: number;
    temp_max: number;
    temp_min: number;
  };
  pop: number;
  sys: { pod: string };
  visibility: number;
  weather: [{ description: string; icon: string; id: number; main: string }];
  wind: { deg: number; gust: number; speed: number };
}

interface CoordsData {
  latitude: number;
  longitude: number;
}

export default function Index() {
  const { theme, setSunrise, setSunset } = useContext(ThemeContext);
  const { setLatLng } = useContext(LocationContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const [location, setLocation] = useState<string | null>(null);

  /** For data */
  const [currentWeather, setCurrentWeather] =
    useState<CurrnetWeatherData | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [dailyWeather, setDailyWeather] = useState([]);

  /** API key */
  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const permissionDenied = (title: string, msg: string) =>
    Alert.alert(title, msg);

  /**  To save in to Async storage */
  const saveIntoAsyncStorage = async (
    cityID: number,
    cityName: string,
    coords: CoordsData,
    currentWeather: CurrnetWeatherData
  ) => {
    /** 
        *  Find local time based on user's device time
          * padStart(targetLength, padString)
	        •	targetLength: length 2 
	        •	padString: "0"
      */

    const todayLocal = new Date();
    const yyyy = todayLocal.getFullYear();
    const mm = String(todayLocal.getMonth() + 1).padStart(2, "0");
    const dd = String(todayLocal.getDate()).padStart(2, "0");
    const hh = String(todayLocal.getHours()).padStart(2, "0");
    const todayString = `${yyyy}-${mm}-${dd} ${hh}:00`;

    const currentLocation = {
      myLocation: true,
      cityIdFromAPI: cityID,
      cityName: cityName,
      saveDate: todayString,
      coords: coords,
      currentWeather: currentWeather,
    };
    try {
      const existing = await AsyncStorage.getItem("myLocation");

      if (existing) {
        const parsed = JSON.parse(existing);
        const savedData = parsed?.saveDate;

        // if its same city and same time do not save
        if (parsed.cityIdFromAPI === cityID && todayString === savedData) {
          console.log("Same location and same date, skipping save.");
          return;
        }
      }

      // Set into storage
      await AsyncStorage.setItem("myLocation", JSON.stringify(currentLocation));
    } catch (err) {
      console.error(`Failed to save location data to storage : ${err}`);
    }
  };

  /** Get data */
  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
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

        // Save cordinate value into context
        setLatLng([latitude, longitude]);

        const [current, hourly] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          ),
        ]);

        /** if you want to get location info through Location from expo
         *  No need, Because the weather api provide simple location info as well
         */
        //   const address = await Location.reverseGeocodeAsync({
        //   latitude,
        //   longitude,
        // });

        const [currentWeatherJSON, hourlyWeatherJSON] = await Promise.all([
          current.json(),
          hourly.json(),
        ]);

        const city = currentWeatherJSON?.name ? currentWeatherJSON?.name : "";

        setLocation(city);

        saveIntoAsyncStorage(
          currentWeatherJSON.id,
          currentWeatherJSON.name,
          {
            latitude: latitude,
            longitude: longitude,
          },
          currentWeatherJSON
        );

        // set Sunrise, Sunset time for React Context

        const { sunrise, sunset } = getLocalDayTime(currentWeatherJSON);

        setSunrise(sunrise);
        setSunset(sunset);

        // current weather
        setCurrentWeather(currentWeatherJSON);

        // hourly weather
        setHourlyWeather(hourlyWeatherJSON?.list?.slice(0, 10));

        //  daily weather
        setDailyWeather(
          hourlyWeatherJSON?.list?.filter((v: DailyHourlyWeatherData) => {
            if (v?.dt_txt?.includes("12:00:00")) {
              return v;
            }
          })
        );
      } catch (err) {
        console.log(err);
        Alert.alert(
          "Error",
          "Unable to access location information. Please allow location permissions on your device."
        );
      }
    }
    getCurrentLocation();
  }, [WEATHER_API_KEY, setSunrise, setSunset, setLatLng]);

  const navigation = useNavigation();

  // to set up dynamic header title
  useEffect(() => {
    navigation.setOptions({ title: location });
  }, [navigation, location]);

  // weatherID value
  const weatherId = currentWeather?.weather?.length
    ? currentWeather.weather[0].id
    : null;

  // weather main value
  const weatherMain = currentWeather?.weather?.length
    ? currentWeather.weather[0].main
    : null;

  // Average temperature for 8 hours
  const averageTemp = Math.round(
    hourlyWeather?.reduce((acc: number, items: DailyHourlyWeatherData) => {
      return acc + (items?.main?.temp ?? 0);
    }, 0) / hourlyWeather.length
  );

  const { sunrise, sunset } = getLocalDayTime(currentWeather);

  return (
    <ScrollView
      className={`flex-1 px-10 ${
        theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"
      }`}
      style={{ width: WINDOW_WIDTH }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {currentWeather && dailyWeather.length > 0 && hourlyWeather.length > 0 ? (
        <Fragment>
          {/* Current weather */}
          <View className="justify-center mt-14">
            {/* Weather Icon */}
            <View className="w-[260px] h-[260px] items-center justify-center">
              {getCurrentWeatherIcons(weatherId ? weatherId : 0, 260, theme)}
            </View>
            <Text
              className={`text-[130px] font-medium ${
                theme === "light" ? "text-black" : "text-white"
              }`}
            >
              {/* Current temp */}
              {Math.round(currentWeather?.main?.temp)}°
            </Text>

            {/* Weather description */}
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } text-[35px] font-medium mt-[-10px]`}
            >
              {weatherMain}
            </Text>

            {/* High temp, Low, temp */}
            <View className="flex-row gap-2 mt-3">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[20px] font-medium`}
              >
                H:{Math.round(currentWeather?.main?.temp_max)}°
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[20px] font-medium`}
              >
                L:{Math.round(currentWeather?.main?.temp_min)}°
              </Text>
            </View>
          </View>

          {/* Hr */}
          <View
            className={` ${
              theme === "light" ? "bg-black" : "bg-white"
            } w-full h-[1px] my-14`}
          />

          {/* Hourly forecast */}
          <View className="w-full">
            {/* title */}
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-bold text-[18px]`}
            >
              Hourly Forecast
            </Text>

            {/* subTitle */}
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-semibold text-[14px] my-7`}
            >
              The average temperature will be {averageTemp}°C.
            </Text>

            <ScrollView horizontal={true}>
              {hourlyWeather?.map((v: DailyHourlyWeatherData, i: number) => {
                /** Time format */
                const hours = new Date(v?.dt_txt).getHours();
                const period = hours >= 12 ? "pm" : "am";

                const formattedTime = `${hours % 12 || 12}${period}`;

                /** Weather icon */
                const weatherIcons =
                  v?.weather?.length > 0 ? v?.weather[0]?.id : 0;

                return (
                  <View key={i} className="mx-3">
                    <Text
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold text-center`}
                    >
                      {formattedTime}
                    </Text>
                    <View className="w-[35px] h-[35px] my-3 flex items-center justify-center">
                      {getWeatherIconsByTime(
                        weatherIcons,
                        hours,
                        35,
                        sunset,
                        sunrise,
                        theme
                      )}
                    </View>

                    <Text
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold text-center text-[17px]`}
                    >
                      {Math.round(v?.main?.temp)}°
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Hr */}
          <View
            className={` ${
              theme === "light" ? "bg-black" : "bg-white"
            } w-full h-[1px] my-14`}
          />

          {/* Daily forecast */}
          <View className="w-full">
            {/* title */}
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-bold text-[18px]`}
            >
              Daily Forecast
            </Text>

            {/* subTitle */}
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-semibold text-[14px] my-7`}
            >
              Temperature information for the next 5 days starting today.
            </Text>

            <ScrollView horizontal={true}>
              {dailyWeather?.map((v: DailyHourlyWeatherData, i: number) => {
                const hours = new Date(v?.dt_txt).getHours();

                /** day format */
                const day = new Date(v?.dt_txt).toLocaleDateString("en-US", {
                  weekday: "short",
                });

                /** Weather icon */
                const weatherIcons =
                  v?.weather?.length > 0 ? v?.weather[0]?.id : 0;

                return (
                  <View key={i} className="mx-3">
                    <Text
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold text-center`}
                    >
                      {day}
                    </Text>
                    <View className="w-[35px] h-[35px] my-3 flex items-center justify-center">
                      {getWeatherIconsByTime(
                        weatherIcons,
                        hours,
                        35,
                        sunset,
                        sunrise,
                        theme
                      )}
                    </View>

                    <Text
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold text-center text-[17px]`}
                    >
                      {Math.round(v?.main?.temp)}°
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Hr */}
          <View
            className={` ${
              theme === "light" ? "bg-black" : "bg-white"
            } w-full h-[1px] my-14`}
          />

          {/* feels like, humidity */}
          <View className="flex-row justify-between w-full">
            <View
              className={`w-[150px] h-[140px] border-[2px] rounded-2xl ${
                theme === "light" ? " border-black" : "border-white"
              }`}
            >
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[16px] mt-6 mx-4`}
              >
                Feels like
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[40px] mt-5 mx-4`}
              >
                {Math.round(currentWeather?.main?.feels_like)}°
              </Text>
            </View>

            <View
              className={`w-[150px] h-[140px] border-[2px] rounded-2xl ${
                theme === "light" ? " border-black" : "border-white"
              }`}
            >
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[16px] mt-6 mx-4`}
              >
                Humidity
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[40px] mt-5 mx-4`}
              >
                {currentWeather?.main?.humidity}%
              </Text>
            </View>
          </View>

          {/* wind */}
          <View
            className={`w-full h-[160px] border-[2px] rounded-2xl ${
              theme === "light" ? " border-black" : "border-white"
            } mt-14 relative`}
          >
            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-semibold text-[16px] mt-6 mx-4`}
            >
              Wind
            </Text>

            <Text
              className={`${
                theme === "light" ? "text-black" : "text-white"
              } font-semibold text-[40px] mt-7 mx-4`}
            >
              {currentWeather?.wind?.speed} m/s
            </Text>
            <View
              className={`w-[85px] h-[85px] absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full border-[2px] ${
                theme === "light" ? "border-black" : "border-white"
              }`}
            >
              <View className="w-full h-full relative flex justify-center items-center">
                <Text
                  className={`absolute top-[-20px] left-1/2 -translate-x-1/2 font-semibold text-[11px] ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                >
                  N
                </Text>
                <Text
                  className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 font-semibold text-[11px] ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                >
                  S
                </Text>
                <Text
                  className={`absolute left-[-20px] top-1/2 -translate-y-1/2 font-semibold text-[11px] ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                >
                  W
                </Text>
                <Text
                  className={`absolute right-[-20px] top-1/2 -translate-y-1/2 font-semibold text-[11px] ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                >
                  E
                </Text>
                <FontAwesome
                  name="location-arrow"
                  size={30}
                  color={theme === "light" ? "black" : "white"}
                  style={{
                    transform: [
                      { rotate: `${currentWeather?.wind?.deg + 135}deg` },
                    ],
                  }}
                />
              </View>
            </View>
          </View>

          {/* Hr */}
          <View
            className={` ${
              theme === "light" ? "bg-black" : "bg-white"
            } w-full h-[1px] my-14`}
          />

          {/* Sunrise, Sunset */}
          <View className="flex-row justify-between w-full">
            {/* Sunrise */}
            <View>
              <Feather
                name="sunrise"
                size={120}
                color={theme === "light" ? "black" : "white"}
              />
              <Text
                className={`text-[20px] ${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[20px] my-6`}
              >
                Sunrise
              </Text>
              <Text
                className={`text-[20px] ${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[40px]`}
              >
                {sunrise % 12 || 12}
                {sunrise >= 12 ? "PM" : "AM"}
              </Text>
            </View>

            {/* Sunset */}
            <View>
              <Feather
                name="sunset"
                size={120}
                color={theme === "light" ? "black" : "white"}
              />
              <Text
                className={`text-[20px] ${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[20px] my-6`}
              >
                Sunset
              </Text>
              <Text
                className={`text-[20px] ${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-[40px]`}
              >
                {sunset % 12 || 12}
                {sunset >= 12 ? "PM" : "AM"}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="mt-10 w-full mb-20">
            {/* feels like */}
            <View className="flex-row justify-between ">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Feels like
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {Math.round(currentWeather?.main?.feels_like)}°
              </Text>
            </View>

            {/* Humidity */}
            <View className="flex-row justify-between mt-4">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Humidity
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {currentWeather?.main?.humidity}%
              </Text>
            </View>

            {/* Wind speed */}
            <View className="flex-row justify-between mt-4">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Wind speed
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {currentWeather?.wind?.speed} m/s
              </Text>
            </View>

            {/* Pressure */}
            <View className="flex-row justify-between mt-4">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Pressure
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {currentWeather?.main?.pressure}
              </Text>
            </View>

            {/* Ground level */}
            <View className="flex-row justify-between mt-4">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Ground level
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {currentWeather?.main?.grnd_level}
              </Text>
            </View>

            {/* Sea level */}
            <View className="flex-row justify-between mt-4">
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                Sea level
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } text-[15px] font-semibold`}
              >
                {currentWeather?.main?.sea_level}
              </Text>
            </View>
          </View>
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
