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
import { useContext, useEffect, useState } from "react";

import { useNavigation } from "expo-router";

import { ThemeContext } from "./_layout";

import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";

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

  console.log(currentWeather);

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
  const getWeatherIcons = (weatherId: number) => {
    if (storm?.includes(weatherId)) {
      return <Ionicons name="thunderstorm-outline" size={230} color="black" />;
    } else if (drizzle?.includes(weatherId) || rain?.includes(weatherId)) {
      return <Ionicons name="rainy-outline" size={230} color="black" />;
    } else if (snow?.includes(weatherId)) {
      return <Ionicons name="snow-outline" size={230} color="black" />;
    } else if (mist?.includes(weatherId)) {
      return <Ionicons name="snow-outline" size={230} color="black" />;
    } else if (clear?.includes(weatherId)) {
      return <Fontisto name="day-sunny" size={230} color="black" />;
    } else if (fewClouds?.includes(weatherId)) {
      const fewClouds =
        theme === "light" ? (
          <Image
            source={require("../assets/images/day-cloudy.png")}
            style={{ height: 202, width: 245 }}
          />
        ) : (
          <Ionicons name="cloudy-night-outline" size={220} color="black" />
        );

      return fewClouds;
    } else if (clouds?.includes(weatherId)) {
      return (
        <Ionicons
          name="cloud-outline"
          size={220}
          color="black"
          className="mb-[-20px]"
        />
      );
    }
  };

  return (
        // <ScrollView
    //   className="flex-1"
    //   horizontal={true}
    //   pagingEnabled={true}
    //   showsHorizontalScrollIndicator={false}
    //   contentContainerStyle={{
    //     justifyContent: "center",
    //     alignItems: "center",
    //   }}
    // >
    //   {dailyWeather?.length > 0 ? (
    //     dailyWeather?.map((v: any, i) => {
    //       const date = new Date(v?.dt_txt);

    //       const weekday = date?.toLocaleDateString("en-GB", {
    //         weekday: "long",
    //       });
    //       const dateMonth = date?.toLocaleDateString("en-GB", {
    //         day: "2-digit",
    //         month: "long",
    //       });

    //       const textColor = theme === "light" ? "text-black" : "text-white";
    //       const borderColor = theme === "light" ? "border-black" : "border-white";
    //       const iconColor = theme === "light" ? "black" : "white";

    //       return (
    //         <View key={i} className="flex-1" style={{ width: WINDOW_WIDTH }}>
    //           {/* Date */}
    //           <View className="flex-[1] justify-center gap-1 px-[30px]">
    //             <Text
    //               className={`font-semibold text-[25px] ${textColor}`}
    //             >
    //               {weekday}
    //             </Text>
    //             <Text
    //               className={`text-[15px]  ${textColor}`}
    //             >
    //               {dateMonth}
    //             </Text>
    //           </View>
    //           {/* hr */}
    //           <View
    //             className={`border-b-[1.3px] ${borderColor} m-auto`}
    //             style={{ width: WINDOW_WIDTH - 60 }}
    //           />
    //           {/* Degree */}
    //           <View className="flex-[2] justify-center m-auto">
    //             <Text
    //               className={`font-semibold text-[128px]  ${textColor}`}
    //             >
    //               {v?.main?.temp?.toFixed(0)}°
    //             </Text>
    //             <Text
    //               className={`font-medium text-[30px] mt-[-15px]  ${textColor}`}
    //             >
    //               {v?.weather[0]?.main}
    //             </Text>
    //           </View>
    //           {/* hr 2 */}
    //           <View
    //             className={`border-b-[1.3px]  ${borderColor} m-auto`}
    //             style={{ width: WINDOW_WIDTH - 60 }}
    //           />
    //           {/* Conditions */}
    //           <View className="flex-[1.4] px-[30px] justify-center gap-6">
    //             {/* feels like, pop */}
    //             <View className="flex-row justify-between">
    //               {/* feels like */}
    //               <View className="flex-row items-center gap-2">
    //                 <FontAwesome5
    //                   name={
    //                     v?.main?.feels_like > 20
    //                       ? `temperature-high`
    //                       : `temperature-low`
    //                   }
    //                   size={18}
    //                   color={iconColor}
    //                 />
    //                 <Text className={`text-[18px] font-semibold ${textColor}`}>
    //                   {v?.main?.feels_like}°C
    //                 </Text>
    //               </View>

    //               {/* pop */}
    //               <View className="flex-row items-center gap-2">
    //                 <Fontisto
    //                   name="rain"
    //                   size={18}
    //                   className="font-bold"
    //                   color={iconColor}
    //                 />
    //                 <View className="flex-row justify-between">
    //                   <Text className={`text-[18px] font-semibold ${textColor}`}>
    //                     {v?.pop * 100}%
    //                   </Text>
    //                 </View>
    //               </View>
    //             </View>

    //             {/* humidity, wind */}
    //             <View className="flex-row justify-between">
    //               <View className="flex-row items-center gap-2">
    //                 <MaterialCommunityIcons
    //                   name="water-outline"
    //                   size={24}
    //                   color={iconColor}
    //                   className="ml-[-6px]"
    //                 />
    //                 <Text className={`text-[18px] font-semibold ${textColor}`}>
    //                   {v?.main?.humidity}%
    //                 </Text>
    //               </View>

    //               <View className="flex-row items-center gap-2">
    //                 <FontAwesome5 name="wind" size={18} color={iconColor} />
    //                 <Text className={`text-[18px] font-semibold ${textColor}`}>
    //                   {v?.wind?.speed}m/s
    //                 </Text>
    //               </View>
    //             </View>
    //           </View>
    //         </View>
    //       );
    //     })
    //   ) : (
    //     <View
    //       className="flex-1 justify-center items-center"
    //       style={{ width: WINDOW_WIDTH }}
    //     >
    //       <ActivityIndicator size="large" color="white" />
    //     </View>
    //   )}
    // </ScrollView>
    
    <ScrollView
      className="flex-1"
      style={{ width: WINDOW_WIDTH }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {currentWeather ? (
        <View className="justify-center">
          {getWeatherIcons(currentWeather?.weather[0]?.id)}
          <Text className="text-[100px] font-medium">
            {Math.round(currentWeather?.main?.temp)}°
          </Text>
        </View>
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
