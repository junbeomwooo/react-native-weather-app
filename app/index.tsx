import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { useEffect, useState } from "react";

import { useNavigation } from "expo-router";

export default function Index() {
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
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        ),
      ]);

      const [currentWeather, dailyWeather] = await Promise.all([
        current.json(),
        daily.json(),
      ]);

      // console.log(
      //   `${JSON.stringify(currentWeather)}`
      // );

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
    // <View className="flex-1">
    //   {/* Date */}
    //   <View className="flex-1 bg-[#FE6346]  justify-center items-center">
    //     <Text style={{ fontSize: 45 }} className="font-semibold">
    //       {location?.city}
    //     </Text>
    //   </View>

    //   {/* Weather */}
    //   <ScrollView
    //     horizontal={true}
    //     pagingEnabled={true}
    //     showsHorizontalScrollIndicator={false}
    //     className="bg-[#FE6346] flex-[2]"
    //     contentContainerStyle={{
    //       justifyContent: "center",
    //       alignItems: "center",
    //     }}
    //   >
    //     {dailyWeather?.length > 0 ? (
    //       dailyWeather?.map((v: any, i) => {
    //         console.log(v);
    //         return (
    //           <View key={i} className="flex-1" style={{ width: WINDOW_WIDTH }}>
    //             <Text
    //               className="text-center font-semibold"
    //               style={{ fontSize: 128 }}
    //             >
    //               {v?.main?.temp?.toFixed(0)}°
    //             </Text>
    //             <Text
    //               style={{ fontSize: 35, marginTop: -15 }}
    //               className="font-medium text-center"
    //             >
    //               {v?.weather[0]?.main}
    //             </Text>
    //           </View>
    //         );
    //       })
    //     ) : (
    //       <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
    //         <ActivityIndicator size="large" color="white" />
    //       </View>
    //     )}
    //   </ScrollView>

    //   {/* Date */}
    //   <View className="flex-1 bg-[#FE6346]  justify-center items-center">
    //     <Text style={{ fontSize: 45 }} className="font-semibold">
    //       {location?.city}
    //     </Text>
    //   </View>
    // </View>
    <ScrollView
      className="flex-1 bg-[#FE6346]"
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
          console.log(v);
          return (
            <View key={i} className="flex-1" style={{ width: WINDOW_WIDTH }}>
              {/* Date */}
              <View className="flex-1 bg-blue-200  justify-center gap-1 px-[30px]">
                <Text className="font-semibold text-[25px]">Monday</Text>
                <Text className="text-[15px]">04 September</Text>
                <View className="w-[80%] border-b-2 border-white my-2" />
              </View>
              {/* Degree */}
              <View className="flex-[2]">
                <Text className="text-center font-semibold text-[128px]">
                  {v?.main?.temp?.toFixed(0)}°
                </Text>
                <Text className="font-medium text-center text-[35px] mt-[-15px]">
                  {v?.weather[0]?.main}
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <View className="flex-1" style={{ width: WINDOW_WIDTH }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </ScrollView>
  );
}
