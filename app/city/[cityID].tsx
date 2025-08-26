import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { Fragment, useEffect, useState } from "react";

import { useGlobalSearchParams, useRouter } from "expo-router";

import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  getCurrentWeatherIcons,
  getWeatherIconsByTime,
} from "@/hooks/getWeatherIcons";

import CityHeader from "@/components/CityHeader";
import getLocalDayTime from "@/hooks/getLocalDayTime";

import major_cities from "@/assets/major_cities_200.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CurrnetWeatherData, DailyHourlyWeatherData } from "..";

export default function City() {
  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const router = useRouter();

  const [location, setLocation] = useState<string | null>(null);

  const [currentWeather, setCurrentWeather] =
    useState<CurrnetWeatherData | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [dailyWeather, setDailyWeather] = useState([]);
  const [lanlng, setLanLng] = useState({});

  // Check if this city exists in your favorite city list
  const [alreadyExist, setAleadyExist] = useState(false);

  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const { cityID } = useGlobalSearchParams();
  const cityObj = major_cities?.find(
    (v: { id: number; name: string }) => v.id === Number(cityID)
  );
  const cityName = cityObj?.name;
  const cityNumber = cityObj?.id;
  const seacrhedCity = Array.isArray(cityName) ? cityName[0] : cityName;

  /** Get data */
  useEffect(() => {
    if (!seacrhedCity) return;
    async function getCityWeather() {
      try {
        const [{ latitude, longitude }] = await Location.geocodeAsync(
          seacrhedCity
        );

        setLanLng({ latitude: latitude, longitude: longitude });

        const [current, hourly] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          ),
        ]);

        const [currentWeatherJSON, hourlyWeatherJSON] = await Promise.all([
          current.json(),
          hourly.json(),
        ]);

        const city = currentWeatherJSON?.name ? currentWeatherJSON?.name : "";

        setLocation(city);

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
        console.error(err);
      }
    }
    getCityWeather();
  }, [WEATHER_API_KEY, seacrhedCity]);

  /** Get AsyncStroage data */
  useEffect(() => {
    const getAsyncStorageData = async () => {
      /** To check if the city already exists in your favorite city list */
      const asyncStrageData = await AsyncStorage.getItem(`city-${cityID}`);

      const existedData = asyncStrageData ? JSON.parse(asyncStrageData) : null;

      if (existedData) setAleadyExist(true);
    };

    getAsyncStorageData();
  }, [cityID]);

  /** Save into AsyncStorage for Header */
  const SaveIntoAsyncStorage = async () => {
    const address = {
      cityID: cityNumber,
      cityName: cityName,
      coords: lanlng,
      currentWeather: {
        main: currentWeather?.main,
        weather: currentWeather?.weather,
        wind: currentWeather?.wind,
      },
    };

    try {
      const keys = await AsyncStorage.getAllKeys();

      if (keys.length >= 5) {
        Alert.alert("Cannot save more than 5 favorite cities.");
        return;
      }

      if (alreadyExist) {
        Alert.alert("This city has already been added to your favorites.");
        return;
      }

      await AsyncStorage.setItem(`city-${cityID}`, JSON.stringify(address));

      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  /** Delete AsynvStorage ITem */
  const DeleteStorageItem = async () => {
    try {
      await AsyncStorage.removeItem(`city-${cityID}`);
      router.back();
    } catch (err) {
      console.error(err);
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

  // Average temperature for 8 hours
  const averageTemp = Math.round(
    hourlyWeather?.reduce((acc: number, items: DailyHourlyWeatherData) => {
      return acc + (items?.main?.temp ?? 0);
    }, 0) / hourlyWeather.length
  );

  const { sunrise, sunset, isNight } = getLocalDayTime(currentWeather);
  const title = location ? location : "";

  return (
    <Fragment>
      <CityHeader
        title={title}
        isNight={isNight}
        alearyExist={alreadyExist}
        onClickSaveIntoAsync={SaveIntoAsyncStorage}
        DeleteStorageItem={DeleteStorageItem}
      />

      <ScrollView
        className={`flex-1 px-10 ${isNight ? "bg-[#080830]" : "bg-[#fed500]"}`}
        style={{ width: WINDOW_WIDTH }}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* content */}
        {currentWeather &&
        dailyWeather.length > 0 &&
        hourlyWeather.length > 0 ? (
          <Fragment>
            {/* Current weather */}
            <View className="justify-center mt-14">
              {/* Weather Icon */}
              <View className="w-[260px] h-[260px] items-center justify-center">
                {getCurrentWeatherIcons(
                  weatherId ? weatherId : 0,
                  260,
                  isNight ? "dark" : "light"
                )}
              </View>
              <Text
                className={`text-[130px] font-medium ${
                  isNight ? "text-white" : "text-black"
                }`}
              >
                {/* Current temp */}
                {Math.round(currentWeather?.main?.temp)}°
              </Text>

              {/* Weather description */}
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
                } text-[35px] font-medium mt-[-10px]`}
              >
                {weatherMain}
              </Text>

              {/* High temp, Low, temp */}
              <View className="flex-row gap-2 mt-3">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[20px] font-medium`}
                >
                  H:{Math.round(currentWeather?.main?.temp_max)}°
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[20px] font-medium`}
                >
                  L:{Math.round(currentWeather?.main?.temp_min)}°
                </Text>
              </View>
            </View>

            {/* Hr */}
            <View
              className={` ${
                isNight ? "bg-white" : "bg-black"
              } w-full h-[1px] my-14`}
            />

            {/* Hourly forecast */}
            <View className="w-full">
              {/* title */}
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
                } font-bold text-[18px]`}
              >
                Hourly Forecast
              </Text>

              {/* subTitle */}
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
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
                          isNight ? "text-white" : "text-black"
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
                          isNight ? "dark" : "light"
                        )}
                      </View>

                      <Text
                        className={`${
                          isNight ? "text-white" : "text-black"
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
                isNight ? "bg-white" : "bg-black"
              } w-full h-[1px] my-14`}
            />

            {/* Daily forecast */}
            <View className="w-full">
              {/* title */}
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
                } font-bold text-[18px]`}
              >
                Daily Forecast
              </Text>

              {/* subTitle */}
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
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
                          isNight ? "text-white" : "text-black"
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
                          isNight ? "dark" : "light"
                        )}
                      </View>

                      <Text
                        className={`${
                          isNight ? "text-white" : "text-black"
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
                isNight ? "bg-white" : "bg-black"
              } w-full h-[1px] my-14`}
            />

            {/* feels like, humidity */}
            <View className="flex-row justify-between w-full">
              <View
                className={`w-[150px] h-[140px] border-[2px] rounded-2xl ${
                  isNight ? "border-white" : " border-black"
                }`}
              >
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[16px] mt-6 mx-4`}
                >
                  Feels like
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[40px] mt-5 mx-4`}
                >
                  {Math.round(currentWeather?.main?.feels_like)}°
                </Text>
              </View>

              <View
                className={`w-[150px] h-[140px] border-[2px] rounded-2xl ${
                  isNight ? "border-white" : " border-black"
                }`}
              >
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[16px] mt-6 mx-4`}
                >
                  Humidity
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[40px] mt-5 mx-4`}
                >
                  {currentWeather?.main?.humidity}%
                </Text>
              </View>
            </View>

            {/* wind */}
            <View
              className={`w-full h-[160px] border-[2px] rounded-2xl ${
                isNight ? "border-white" : " border-black"
              } mt-14 relative`}
            >
              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
                } font-semibold text-[16px] mt-6 mx-4`}
              >
                Wind
              </Text>

              <Text
                className={`${
                  isNight ? "text-white" : "text-black"
                } font-semibold text-[40px] mt-7 mx-4`}
              >
                {currentWeather?.wind?.speed} m/s
              </Text>
              <View
                className={`w-[85px] h-[85px] absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full border-[2px] ${
                  isNight ? "border-white" : " border-black"
                }`}
              >
                <View className="w-full h-full relative flex justify-center items-center">
                  <Text
                    className={`absolute top-[-20px] left-1/2 -translate-x-1/2 font-semibold text-[11px] ${
                      isNight ? "text-white" : "text-black"
                    }`}
                  >
                    N
                  </Text>
                  <Text
                    className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 font-semibold text-[11px] ${
                      isNight ? "text-white" : "text-black"
                    }`}
                  >
                    S
                  </Text>
                  <Text
                    className={`absolute left-[-20px] top-1/2 -translate-y-1/2 font-semibold text-[11px] ${
                      isNight ? "text-white" : "text-black"
                    }`}
                  >
                    W
                  </Text>
                  <Text
                    className={`absolute right-[-20px] top-1/2 -translate-y-1/2 font-semibold text-[11px] ${
                      isNight ? "text-white" : "text-black"
                    }`}
                  >
                    E
                  </Text>
                  <FontAwesome
                    name="location-arrow"
                    size={30}
                    color={isNight ? "white" : "black"}
                    style={{
                      transform: [
                        { rotate: `${currentWeather?.wind?.deg + 180}deg` },
                      ],
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Hr */}
            <View
              className={` ${
                isNight ? "bg-white" : "bg-black"
              } w-full h-[1px] my-14`}
            />

            {/* Sunrise, Sunset */}
            <View className="flex-row justify-between w-full">
              {/* Sunrise */}
              <View>
                <Feather
                  name="sunrise"
                  size={120}
                  color={isNight ? "white" : "black"}
                />
                <Text
                  className={`text-[20px] ${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[20px] my-6`}
                >
                  Sunrise
                </Text>
                <Text
                  className={`text-[20px] ${
                    isNight ? "text-white" : "text-black"
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
                  color={isNight ? "white" : "black"}
                />
                <Text
                  className={`text-[20px] ${
                    isNight ? "text-white" : "text-black"
                  } font-semibold text-[20px] my-6`}
                >
                  Sunset
                </Text>
                <Text
                  className={`text-[20px] ${
                    isNight ? "text-white" : "text-black"
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
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Feels like
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  {Math.round(currentWeather?.main?.feels_like)}°
                </Text>
              </View>

              {/* Humidity */}
              <View className="flex-row justify-between mt-4">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Humidity
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  {currentWeather?.main?.humidity}%
                </Text>
              </View>

              {/* Wind speed */}
              <View className="flex-row justify-between mt-4">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Wind speed
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  {currentWeather?.wind?.speed} m/s
                </Text>
              </View>

              {/* Pressure */}
              <View className="flex-row justify-between mt-4">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Pressure
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  {currentWeather?.main?.pressure}
                </Text>
              </View>

              {/* Ground level */}
              <View className="flex-row justify-between mt-4">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Ground level
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  {currentWeather?.main?.grnd_level}
                </Text>
              </View>

              {/* Sea level */}
              <View className="flex-row justify-between mt-4">
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
                  } text-[15px] font-semibold`}
                >
                  Sea level
                </Text>
                <Text
                  className={`${
                    isNight ? "text-white" : "text-black"
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
    </Fragment>
  );
}
