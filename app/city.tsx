import { ThemeContext } from "@/context/ThemeContext";

import { Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const { theme } = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;
    const WINDOW_HEIGHT = Dimensions.get("window").width;

  const [cities, setCities] = useState([]);

  const capitalizeDesc = (desc: string) => {
    return desc
      ?.split(" ")
      ?.map((v) => v?.charAt(0)?.toUpperCase() + v?.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const getData = async () => {
      const address = await AsyncStorage.getItem("location");

      if (address) {
        const parsedData = JSON.parse(address);
        setCities(parsedData);
      }
    };
    getData();
  }, []);

  /** Linear Gradient Animation */

  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: { x: -WINDOW_WIDTH / 2, y: -WINDOW_HEIGHT / 4 },
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: { x: 0, y: 0 },
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [WINDOW_HEIGHT, translate, WINDOW_WIDTH]);

  return (
    <ScrollView
      className="flex-1 px-6"
      style={{ width: WINDOW_WIDTH }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        className={`${
          theme === "light" ? "text-black" : "text-white"
        } text-[40px] font-bold text-start w-full`}
      >
        Weather
      </Text>
      <TextInput
        autoCapitalize={"words"}
        returnKeyType={"search"}
        className="w-full bg-white h-12 rounded-xl mt-5 px-5"
        maxLength={20}
        placeholder="Search for a city or country"
      />

      {cities?.length > 0 ? (
        cities?.map((v: any, i: number) => {
          // Sunrise hour
          const sunriseDate = new Date(v?.sys?.sunrise * 1000);
          const sunriseHours = sunriseDate.getHours();

          // Sunset hour
          const sunsetDate = new Date(v?.sys?.sunset * 1000);
          const sunsetHours = sunsetDate.getHours();

          // now time
          const now = new Date(v?.timestamp).getHours();

          console.log(sunriseHours);
          console.log(sunsetHours);
          console.log(now);
          console.log(v);

          const isNight = now >= sunsetHours || now < sunriseHours;
          return (
            <View
              className="w-full h-36 mt-10 rounded-2xl flex-row px-5 py-3 justify-between"
              key={i}
            >
              {/* Gradient 배경만 이동 */}
              <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded-2xl ">
                <Animated.View
                  style={{
                    width: "300%",
                    height: "300%",
                    transform: [
                      { translateX: translate.x },
                      { translateY: translate.y },
                    ],
                  }}
                >
                  <LinearGradient
                    colors={
                      isNight
                        ? ["#0a0a3c", "#1a237e", "#3f51b5", "#140478", "black"]
                        : ["#87ceeb", "#a0d8ef", "#fef3b3", "#c1e1c1"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </Animated.View>
              </View>
              <View className="justify-between">
                <View>
                  <Text
                    className={`${
                      isNight ? "text-white" : "text-black"
                    } font-bold text-[25px]`}
                  >
                    {v.name}
                  </Text>
                  <Text
                    className={`${
                      isNight ? "text-white" : "text-black"
                    } font-semibold text-[12px]`}
                  >
                    {v?.myLocation ? "My Location" : ""}
                  </Text>
                </View>
                <View>
                  <Text
                    className={`${
                      isNight ? "text-white" : "text-black"
                    } font-medium text-[12px]`}
                  >
                    {capitalizeDesc(v?.weather[0]?.description)}
                  </Text>
                </View>
              </View>
              <View className="justify-between">
                <View>
                  <Text
                    className={`${
                      isNight ? "text-white" : "text-black"
                    } font-bold text-[40px] text-right`}
                  >
                    {Math.round(v?.main?.temp)}°
                  </Text>
                </View>
                <View>
                  <Text
                    className={`${
                      isNight ? "text-white" : "text-black"
                    } font-medium text-[12px]`}
                  >
                    {capitalizeDesc(v?.weather[0]?.description)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <Fragment></Fragment>
      )}
    </ScrollView>
  );
}
