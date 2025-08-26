import { ListContext } from "@/context/EditContext";
import { ThemeContext } from "@/context/ThemeContext";

import { Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";

import major_cities from "@/assets/major_cities_200.json";
import { LinearGradient } from "expo-linear-gradient";

import getLocalDayTime from "@/hooks/getLocalDayTime";

import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AsyncStorageData {
  cityID: number;
  cityName: string;
  coords: {
    latitude: number;
    longitude: number;
  };
}

export interface AsyncWeatherData {
  coord: { lon: number; lat: number };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;

  // optional
  cityID?: number;

  // optional
  myLocation?: boolean;
}

export default function List() {
  /** Global context state  */
  const { theme } = useContext(ThemeContext);
  const listContext = useContext(ListContext);
  if (!listContext)
    throw new Error("listContext must be used within EditProvider");
  const {
    isEditOpen,
    textInputPressIn,
    setTextInputPressIn,
    searchInput,
    setSearchInput,
  } = listContext;

  /** router */
  const router = useRouter();

  /** The width and height for device */
  const WINDOW_WIDTH = Dimensions.get("window").width;

  const textInputRef = useRef<TextInput>(null);

  /** Data for favorite cities */
  const [cities, setCities] = useState<AsyncWeatherData[]>([]);

  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const pathname = usePathname();

  // Clear search input when entering the list page
  useEffect(() => {
    setSearchInput("");
    setFilteredCities([]);
    setTextInputPressIn(false);
    textInputRef.current?.blur();
  }, [setSearchInput, setTextInputPressIn, pathname]);

  /** Capitalize function */
  const capitalizeDesc = (desc: string) => {
    if (!desc) return "";

    return desc
      ?.split(" ")
      ?.map((v) => v?.charAt(0)?.toUpperCase() + v?.slice(1))
      .join(" ");
  };

  /** Recieve data from asnyce storage and API  */
  useEffect(() => {
    const getData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();

        const allDataFromStorage = await AsyncStorage.multiGet(keys);

        const parsed = allDataFromStorage.map(
          ([key, value]: [key: string, value: any]) => {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          }
        );

        const request = parsed?.map((v: AsyncStorageData) => {
          if (!v?.coords) return null;
          const { latitude, longitude } = v?.coords;
          return fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          ).then((payload) => payload.json());
        });

        const results = await Promise.all(request);

        const city = results.map((v: AsyncWeatherData, i: number) => {
          const storageData = parsed[i];
          return {
            ...v,
            cityID: storageData.cityID || storageData.cityIdFromAPI,
            ...(storageData.myLocation
              ? { myLocation: storageData.myLocation }
              : {}),
          };
        });
        setCities(city);
      } catch (err) {
        console.error(err);
      }
    };

    getData();
  }, [WEATHER_API_KEY, pathname]);

  /** filter */

  const [filterCities, setFilteredCities] = useState<
    { id: number; name: string }[]
  >([]);

  // Filter cities based on user input
  const onChangeText = (text: string) => {
    setSearchInput(text);

    if (text.length >= 1) {
      const filtered = major_cities.filter(
        (city: { id: number; name: string }) =>
          city.name.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  /** Delete AsynvStorage ITem */
  const DeleteStorageItem = async (cityID: number) => {
    try {
      await AsyncStorage.removeItem(`city-${cityID}`);
      router.replace("/list");
      setCities((prev) => {
        const updateded = prev.filter((v) => v?.cityID !== cityID);
        return updateded;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // To sort the ‘myLocation’ city to the top
  const sortedCities = [...cities].sort(
    (a: AsyncWeatherData, b: AsyncWeatherData) => {
      if (a.myLocation) return -1;
      if (b.myLocation) return 1;
      return 0;
    }
  );

  /** Animations  */

  // Linear Gradient Animation

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-WINDOW_WIDTH / 2, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
      ),
      -1,
      true
    );
  }, [translateX, WINDOW_WIDTH]);

  const gradientAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Animation for city lists

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const animatedFavCitiesHeight = useSharedValue(130);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedFavCitiesHeight.value,
    };
  });

  useEffect(() => {
    animatedFavCitiesHeight.value = withTiming(isEditOpen ? 80 : 130, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [isEditOpen, animatedFavCitiesHeight]);

  // Animation for TextInput

  const cancelWidth = useSharedValue(0);
  const cancelOpacity = useSharedValue(0);

  useEffect(() => {
    if (textInputPressIn || filterCities.length > 0 || searchInput) {
      cancelWidth.value = withTiming(70, { duration: 300 });
      cancelOpacity.value = withTiming(1, { duration: 100 });
    } else {
      cancelWidth.value = withTiming(0, { duration: 300 });
      cancelOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [
    cancelWidth,
    filterCities.length,
    textInputPressIn,
    cancelOpacity,
    searchInput,
  ]);

  const animatedCancelStyle = useAnimatedStyle(() => ({
    width: cancelWidth.value,
    opacity: cancelOpacity.value,
  }));

  // Animation for Title
  const titleHeight = useSharedValue(1);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    if (!textInputPressIn && !searchInput && filterCities?.length === 0) {
      titleHeight.value = withTiming(50, { duration: 300 });
      titleOpacity.value = withTiming(1, { duration: 100 });
    } else {
      titleHeight.value = withTiming(0, { duration: 300 });
      titleOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [filterCities, textInputPressIn, titleHeight, titleOpacity, searchInput]);

  const animatedTitleStyle = useAnimatedStyle(() => ({
    height: titleHeight.value,
    opacity: titleOpacity.value,
  }));

  return (
    <Fragment>
      <View
        className={`flex-1 ${
          theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"
        }`}
        style={{
          width: WINDOW_WIDTH,
          alignItems: "center",
        }}
      >
        <Animated.Text
          className={`${
            theme === "light" ? "text-black" : "text-white"
          } text-[40px] font-bold text-start w-full px-6 `}
          style={animatedTitleStyle}
        >
          Weather
        </Animated.Text>

        <View className="w-full flex-1 ">
          {/* TextInput */}
          <View
            className={`flex-row w-full items-center px-6 mb-5 ${
              textInputPressIn || searchInput ? "mt-0" : " mt-5"
            }`}
          >
            <TextInput
              value={searchInput}
              returnKeyType={"search"}
              className={`w-full h-12 rounded-xl px-4 text-lg leading-[20px] flex-1 ${
                theme === "light"
                  ? "bg-white text-black"
                  : "bg-[#1c1c45] text-white"
              }`}
              maxLength={20}
              placeholder="Search for a city"
              onChangeText={onChangeText}
              placeholderTextColor="#888888"
              onFocus={() => setTextInputPressIn(true)}
              onBlur={() => setTextInputPressIn(false)}
              ref={textInputRef}
              autoCorrect={false}
              autoComplete="off"
            />

            <AnimatedPressable
              className="pl-4 w-auto"
              hitSlop={5}
              onPress={() => {
                textInputRef.current?.clear();
                setFilteredCities([]);
                setTextInputPressIn(false);
                setSearchInput("");
                textInputRef.current?.blur();
              }}
              style={animatedCancelStyle}
            >
              <Text
                className={`text-lg font-normal ${
                  theme === "light" ? "text-black" : "text-white"
                } `}
                numberOfLines={1}
              >
                Cancle
              </Text>
            </AnimatedPressable>
          </View>

          {/* Show Filtered Cities */}
          {filterCities?.length > 0 && searchInput ? (
            <FlatList
              data={filterCities}
              renderItem={({
                item,
              }: {
                item: { id: number; name: string };
              }) => (
                <Pressable onPressIn={() => router.push(`/city/${item?.id}`)}>
                  <Text
                    className={`${
                      theme === "light" ? "text-black" : "text-white"
                    } w-full my-2 mx-4 text-lg px-6 `}
                  >
                    {item?.name}
                  </Text>
                </Pressable>
              )}
              keyExtractor={(item: { id: number; name: string }) =>
                item?.id.toString()
              }
            />
          ) : filterCities?.length === 0 && searchInput ? (
            // No results
            <View
              className={`w-full ${
                textInputPressIn ? "h-[50%]" : "h-[80%]"
              } items-center justify-center`}
            >
              <AntDesign
                name="search1"
                size={40}
                color={theme === "light" ? "black" : "white"}
              />
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-2xl`}
              >
                No Results
              </Text>
              <Text
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } mt-2`}
              >
                {`No results found for "${searchInput}"`}
              </Text>
            </View>
          ) : (
            <></>
          )}

          {/* Your favorite cities */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 50 }}
            className="px-6 "
          >
            {sortedCities?.length > 0 &&
            filterCities?.length === 0 &&
            !searchInput ? (
              sortedCities?.map((v: AsyncWeatherData, i: number) => {
                const { isNight } = getLocalDayTime(v);
                const desc = v?.weather?.[0]?.description ?? "";
                const cityID = v.cityID ? v.cityID : 0;

                return (
                  <View key={i} className="flex-row items-center flex-1">
                    {isEditOpen && !v?.myLocation && (
                      <MaterialIcons
                        name="cancel"
                        size={30}
                        color="red"
                        className="mt-6 mr-5"
                        onPress={() => DeleteStorageItem(cityID)}
                      />
                    )}

                    {/* List */}
                    <AnimatedPressable
                      className={`mt-6 rounded-2xl flex-row px-5 py-3 justify-between flex-1 ${
                        textInputPressIn && "opacity-70"
                      }`}
                      style={[animatedStyle, { overflow: "hidden" }]}
                      onPress={() =>
                        v?.myLocation === true
                          ? router.push("/")
                          : router.push(`/city/${v?.cityID}`)
                      }
                    >
                      <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded-2xl ">
                        {/* Gradient Aniamtion Background */}
                        <Animated.View
                          style={[
                            {
                              width: "200%",
                            },
                            gradientAnimationStyle,
                          ]}
                        >
                          <LinearGradient
                            colors={
                              isNight
                                ? [
                                    "#0a0a3c",
                                    "#1a237e",
                                    "#283a9f",
                                    "#3f1dad",
                                    "#140478",
                                    "black",
                                  ]
                                : [
                                    "#fef3b3",
                                    "#ffd97d",
                                    "#ffc857",
                                    "#ffb347",
                                    "#ffeabf",
                                  ]
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
                            } font-bold text-[23px]`}
                            numberOfLines={1}
                            style={{ maxWidth: 190 }}
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
                            } font-medium text-[12px] ${
                              isEditOpen && "hidden"
                            }`}
                          >
                            {capitalizeDesc(desc)}
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
                            } font-medium text-[12px] ${
                              isEditOpen && "hidden"
                            }`}
                          >
                            Feels_like: {Math.round(v?.main?.feels_like)}°
                          </Text>
                        </View>
                      </View>
                    </AnimatedPressable>
                  </View>
                );
              })
            ) : (
              <Fragment></Fragment>
            )}
          </ScrollView>
        </View>
      </View>
    </Fragment>
  );
}
