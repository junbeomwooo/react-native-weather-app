import { ThemeContext } from "@/context/ThemeContext";

import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { Fragment, useContext, useEffect, useState } from "react";

import { useGlobalSearchParams, useNavigation } from "expo-router";

import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  getCurrentWeatherIcons,
  getWeatherIconsByTime,
} from "@/hooks/getWeatherIcons";

import CityHeader from "@/components/CityHeader";
import getLocalDayTime from "@/hooks/getLocalDayTime";

export default function City() {
  const { setSunrise, setSunset } = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const [location, setLocation] = useState<any>(null);

  const [currentWeather, setCurrentWeather] = useState<any>({});
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [dailyWeather, setDailyWeather] = useState([]);

  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const { cityName } = useGlobalSearchParams();
  const seacrhedCity = Array.isArray(cityName) ? cityName[0] : cityName;

  useEffect(() => {
    async function getCityWeather() {
      console.log(seacrhedCity);
      const [{ latitude, longitude }] = await Location.geocodeAsync(
        seacrhedCity
      );

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

      // set Sunrise, Sunset time for React Context

      // Sunrise hour
      const sunriseDate = new Date(currentWeatherJSON?.sys?.sunrise * 1000);
      const sunriseHours = sunriseDate.getHours();

      // Sunset hour
      const sunsetDate = new Date(currentWeatherJSON?.sys?.sunset * 1000);
      const sunsetHours = sunsetDate.getHours();

      setSunrise(sunriseHours);
      setSunset(sunsetHours);

      // current weather
      setCurrentWeather(currentWeatherJSON);

      // hourly weather
      setHourlyWeather(hourlyWeatherJSON?.list?.slice(0, 10));

      //  daily weather
      setDailyWeather(
        hourlyWeatherJSON?.list?.filter((v: any) => {
          if (v?.dt_txt?.includes("12:00:00")) {
            return v;
          }
        })
      );
    }
    getCityWeather();
  }, [WEATHER_API_KEY, seacrhedCity, setSunrise, setSunset]);

  const navigation = useNavigation();

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
    hourlyWeather?.reduce((acc: number, items: any) => {
      return acc + (items?.main?.temp ?? 0);
    }, 0) / hourlyWeather.length
  );

  const { sunrise, sunset, isNight } = getLocalDayTime(currentWeather);

  // to set up dynamic header title
  useEffect(() => {
    navigation.setOptions({
      title: location,
    });
  }, [navigation, location, isNight]);

  return (
    <Fragment>
      <CityHeader title={location} isNight={isNight} />

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
                {hourlyWeather?.map((v: any, i: number) => {
                  /** Time format */
                  const hours = new Date(v?.dt_txt).getHours();
                  const period = hours >= 12 ? "pm" : "am";

                  const formattedTime = `${hours % 12 || 12}${period}`;

                  /** Weather icon */
                  const weatherIcons =
                    v?.weather?.length > 0 ? v?.weather[0]?.id : null;

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
                {dailyWeather?.map((v: any, i: number) => {
                  const hours = new Date(v?.dt_txt).getHours();

                  /** day format */
                  const day = new Date(v?.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  });

                  /** Weather icon */
                  const weatherIcons =
                    v?.weather?.length > 0 ? v?.weather[0]?.id : null;

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
