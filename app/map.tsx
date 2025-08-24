import { LocationContext } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { JSX, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { getWeatherIconsforMaps } from "@/hooks/getWeatherIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AsyncData {
  myLocation?: boolean;
  cityIdFromAPI?: number;
  cityID?: number;
  cityName: string;
  saveDate?: string;
  coords: {
    latitude: number;
    longitude: number;
  };
  currentWeather?: {
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
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
  };
}

export default function Map() {
  /** API key */
  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  /** Map ref */
  const mapRef = useRef<MapView>(null);

  /** router */
  const router = useRouter();

  /** State value for Map layer type
   * - clouds_new
   * - precipitation_new
   * - pressure_new
   * - wind_new
   * - temp_new
   */

  const [isLayerListOpen, setLayerListOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("clouds_new");
  const [isWeatherInfoOpen, setIsWeatherInfoOpen] = useState(false);
  const [asyncData, setAsyncData] = useState<AsyncData[] | null>(null);

  const { theme } = useContext(ThemeContext);
  const {
    latlng: [lat, lng],
  } = useContext(LocationContext);

  const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } =
    Dimensions.get("window");

  useEffect(() => {
    const getAsnycData = async () => {
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

      setAsyncData(parsed);
    };
    getAsnycData();
  }, []);

  // To sort the ‘myLocation’ city to the top
  const sortedCities = [...(asyncData ?? [])].sort(
    (a: AsyncData, b: AsyncData) => {
      if (a.myLocation) return -1;
      if (b.myLocation) return 1;
      return 0;
    }
  );

  /** Move to location */

  // Move to Current Location
  const moveToCurrentLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 6.5,
          longitudeDelta: 6.5,
        },
        1000
      );
    }
  };

  // Move to selected location
  const moveToSelectedLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 6.5,
          longitudeDelta: 6.5,
        },
        1000
      );
      setIsWeatherInfoOpen(false);
    }
  };

  /** Weather Icon */

  let weatherIcon;
  switch (selectedLayer) {
    case "clouds_new":
      weatherIcon = <Ionicons name="cloud-outline" size={46} color="black" />;
      break;
    case "precipitation_new":
      weatherIcon = (
        <Ionicons name="umbrella-outline" size={44} color="black" />
      );
      break;
    case "pressure_new":
      weatherIcon = (
        <MaterialCommunityIcons name="waves" size={44} color="black" />
      );
      break;
    case "wind_new":
      weatherIcon = (
        <MaterialCommunityIcons name="weather-windy" size={42} color="black" />
      );
      break;
    case "temp_new":
      weatherIcon = (
        <FontAwesome6 name="temperature-half" size={40} color="black" />
      );
      break;
    default:
      weatherIcon = null;
  }

  let layerOption;
  switch (selectedLayer) {
    case "clouds_new":
      layerOption = "Clouds";
      break;
    case "precipitation_new":
      layerOption = "Precipitation";
      break;
    case "pressure_new":
      layerOption = "Pressure";
      break;
    case "wind_new":
      layerOption = "Wind";
      break;
    case "temp_new":
      layerOption = "Temperature";
      break;
    default:
      layerOption = null;
  }

  /** Wind Icons */

  // Get wind directions
  const getWindDirection = (deg: number): string => {
    if (deg >= 337.5 || deg < 22.5) return "N";
    if (deg >= 22.5 && deg < 67.5) return "NE";
    if (deg >= 67.5 && deg < 112.5) return "E";
    if (deg >= 112.5 && deg < 157.5) return "SE";
    if (deg >= 157.5 && deg < 202.5) return "S";
    if (deg >= 202.5 && deg < 247.5) return "SW";
    if (deg >= 247.5 && deg < 292.5) return "W";
    if (deg >= 292.5 && deg < 337.5) return "NW";
    return "";
  };

  // Get wind deg icons based on wind directions
  const getWindIconsDeg = (deg: string): number => {
    if (deg === "N") return 0;
    if (deg === "NE") return 45;
    if (deg === "E") return 90;
    if (deg === "SE") return 135;
    if (deg === "S") return 180;
    if (deg === "SW") return 225;
    if (deg === "W") return 270;
    if (deg === "NW") return 315;
    return 360;
  };

  // Animation Popup for Saved cities

  const weatherInfoHeight = useSharedValue(0);
  const weatherInfoOpacity = useSharedValue(0);

  useEffect(() => {
    if (isWeatherInfoOpen) {
      weatherInfoHeight.value = withTiming(WINDOW_HEIGHT / 2, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      weatherInfoOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      weatherInfoHeight.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      weatherInfoOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [weatherInfoHeight, isWeatherInfoOpen, WINDOW_HEIGHT, weatherInfoOpacity]);

  const animatedWeatherInfoStyle = useAnimatedStyle(() => ({
    height: weatherInfoHeight.value,
    opacity: weatherInfoOpacity.value,
  }));

  // Animation for layer list

  const layerListHeight = useSharedValue(0);
  const layerListWidth = useSharedValue(0);
  const layerListOpacity = useSharedValue(0);

  useEffect(() => {
    if (isLayerListOpen) {
      layerListHeight.value = withTiming(233, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      layerListWidth.value = withTiming(220, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      layerListOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    } else {
      layerListHeight.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      layerListWidth.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      layerListOpacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [layerListHeight, isLayerListOpen, WINDOW_HEIGHT, layerListOpacity, layerListWidth]);

  const animatedlayerListAnimation = useAnimatedStyle(() => ({
    height: layerListHeight.value,
    width: layerListWidth.value,
    opacity: layerListOpacity.value,
  }));

  return (
    <SafeAreaView
      className={`${theme === "light" ? "bg-white" : "bg-black"} flex-1`}
    >
      {/* Overlay */}
      {(isLayerListOpen || isWeatherInfoOpen) && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            zIndex: 10,
          }}
          onPress={() => {
            setLayerListOpen(false);
            setIsWeatherInfoOpen(false);
          }}
        />
      )}

      {/* All contents */}
      <View style={{ width: WINDOW_WIDTH, height: WINDOW_HEIGHT }}>
        {/* Map */}
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 13,
            longitudeDelta: 13,
          }}
          ref={mapRef}
        >
          {/* Tile */}
          <UrlTile
            urlTemplate={`https://tile.openweathermap.org/map/${selectedLayer}/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`}
          />
        </MapView>

        {/* Content */}
        <View className="flex-row justify-between absolute w-full px-4 pt-4">
          {/* Done */}
          <Pressable
            className="w-[70px] h-[47px] bg-slate-100 justify-center items-center rounded-lg"
            hitSlop={5}
            onPress={() => router.back()}
          >
            <Text className=" text-xl">Done</Text>
          </Pressable>
          {/* Icons */}
          <View className="items-end">
            {/* location */}
            <Pressable
              hitSlop={5}
              className="w-[47px] h-[47px] bg-slate-100 justify-center items-center rounded-lg"
              onPress={moveToCurrentLocation}
            >
              <MaterialIcons
                name="location-searching"
                size={20}
                color="black"
              />
            </Pressable>
            {/* menu */}
            <Pressable
              hitSlop={5}
              className="w-[47px] h-[47px] bg-slate-100 justify-center items-center rounded-lg mt-3"
              onPress={() => setIsWeatherInfoOpen((prev) => !prev)}
            >
              <Entypo name="menu" size={23} color="black" />
            </Pressable>
            {/* map layer list */}
            <Pressable
              hitSlop={5}
              className="w-[47px] h-[47px] bg-slate-100 justify-center items-center rounded-lg mt-3"
              onPress={() => setLayerListOpen((prev) => !prev)}
            >
              <Octicons name="stack" size={20} color="black" />
            </Pressable>

            {/* Layer list (On/Off) */}
            {
              <Animated.View
                className="bg-slate-100 mt-4 rounded-lg px-5 z-20 overflow-hidden"
                style={animatedlayerListAnimation}
              >
                {/* Clouds */}
                <Pressable
                  className="flex-row justify-between py-3 items-center"
                  hitSlop={5}
                  onPress={() => {
                    setSelectedLayer("clouds_new");
                    setLayerListOpen(false);
                  }}
                >
                  {/* check icon , layer title */}
                  <View className="flex-row items-center">
                    {selectedLayer === "clouds_new" ? (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="mr-2"
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="opacity-0 mr-2"
                      />
                    )}
                    <Text className="text-lg">Clouds</Text>
                  </View>
                  {/* icons */}
                  <Ionicons name="cloud-outline" size={24} color="black" />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/* Precipitation */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                  onPress={() => {
                    setSelectedLayer("precipitation_new");
                    setLayerListOpen(false);
                  }}
                >
                  {/* check icon , layer title */}
                  <View className="flex-row items-center">
                    {selectedLayer === "precipitation_new" ? (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="mr-2"
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="opacity-0 mr-2"
                      />
                    )}
                    <Text className="text-lg">Precipitation</Text>
                  </View>
                  {/* icons */}
                  <Ionicons name="umbrella-outline" size={24} color="black" />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/*Pressure */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                  onPress={() => {
                    setSelectedLayer("pressure_new");
                    setLayerListOpen(false);
                  }}
                >
                  {/* check icon , layer title */}
                  <View className="flex-row items-center">
                    {selectedLayer === "pressure_new" ? (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="mr-2"
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="opacity-0 mr-2"
                      />
                    )}
                    <Text className="text-lg">Pressure</Text>
                  </View>
                  {/* icons */}
                  <MaterialCommunityIcons
                    name="waves"
                    size={24}
                    color="black"
                  />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/* Wind */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                  onPress={() => {
                    setSelectedLayer("wind_new");
                    setLayerListOpen(false);
                  }}
                >
                  {/* check icon , layer title */}
                  <View className="flex-row items-center">
                    {selectedLayer === "wind_new" ? (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="mr-2"
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="opacity-0 mr-2"
                      />
                    )}
                    <Text className="text-lg">Wind</Text>
                  </View>
                  {/* icons */}
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={24}
                    color="black"
                  />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/* Temperature */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                  onPress={() => {
                    setSelectedLayer("temp_new");
                    setLayerListOpen(false);
                  }}
                >
                  {/* check icon , layer title */}
                  <View className="flex-row items-center">
                    {selectedLayer === "temp_new" ? (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="mr-2"
                      />
                    ) : (
                      <Feather
                        name="check"
                        size={18}
                        color="black"
                        className="opacity-0 mr-2"
                      />
                    )}
                    <Text className="text-lg">Temperature</Text>
                  </View>
                  {/* icons */}
                  <FontAwesome6
                    name="temperature-half"
                    size={22}
                    color="black"
                  />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />
              </Animated.View>
            }
          </View>
        </View>

        {/* Weather Info list (On/Off) */}
        {
          <Animated.View
            className="w-full bg-slate-100 absolute bottom-0 pt-5 z-20"
            style={animatedWeatherInfoStyle}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center px-7 pb-4">
              {/* Icons and Title */}
              <View className="flex-row items-center">
                {/* Icons */}
                <View className="mr-[12px]">{weatherIcon}</View>
                {/* Weather desc */}
                <View>
                  <Text className="font-semibold text-lg">{layerOption}</Text>
                  <Text className="text-sm font-normal text-gray-500">
                    Your Locations
                  </Text>
                </View>
              </View>

              {/* Cancle Icon */}
              <Pressable
                hitSlop={5}
                onPress={() => setIsWeatherInfoOpen(false)}
              >
                <MaterialIcons name="cancel" size={30} color="black" />
              </Pressable>
            </View>

            {/* Async data */}
            <ScrollView>
              <View className="mx-7 mt-4 rounded-2xl bg-white mb-[120px]">
                {sortedCities?.map((v, i) => {
                  /** Weather Icons */
                  const weatherIcons = v?.currentWeather?.weather[0]?.id ?? 0;

                  /** Wind direction */
                  // Wind deg number value
                  const windDegNumber = v?.currentWeather?.wind?.deg
                    ? v?.currentWeather?.wind?.deg
                    : 0;

                  // Wind deg string value
                  const windDegString = getWindDirection(windDegNumber);

                  // Wind deg number value divided into 8 directions
                  const weatherDegNumberForIcons =
                    getWindIconsDeg(windDegString);

                  /** Desc */
                  // Description for left
                  const leftDescMap: Record<string, JSX.Element | null> = {
                    clouds_new: null,
                    precipitation_new: null,
                    pressure_new: (
                      <Text className="text-gray-500 font-normal text-sm">
                        {`Sea: ${v?.currentWeather?.main?.sea_level}, Ground: ${v?.currentWeather?.main?.grnd_level}`}
                      </Text>
                    ),
                    wind_new: (
                      <Text className="text-gray-500 font-normal text-sm">
                        {`Wind: ${v?.currentWeather?.wind?.speed} m/s`}
                      </Text>
                    ),
                    temp_new: (
                      <Text className="text-gray-500 font-normal text-sm">
                        {`H: ${v?.currentWeather?.main?.temp_max.toFixed(
                          0
                        )}°, L: ${v?.currentWeather?.main?.temp_min.toFixed(
                          0
                        )}°`}
                      </Text>
                    ),
                  };

                  // Description for right
                  const rightDescMap: Record<string, JSX.Element | undefined> =
                    {
                      clouds_new: getWeatherIconsforMaps(
                        weatherIcons,
                        30,
                        theme
                      ),
                      precipitation_new: getWeatherIconsforMaps(
                        weatherIcons,
                        30,
                        theme
                      ),
                      pressure_new: (
                        <Text className="text-gray-500 font-normal text-lg">
                          {v?.currentWeather?.main?.pressure}
                        </Text>
                      ),
                      wind_new: (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="arrow-up-outline"
                            size={20}
                            color="light"
                            className="opacity-50"
                            style={{
                              transform: [
                                {
                                  rotate: `${
                                    weatherDegNumberForIcons + 180
                                  }deg`,
                                },
                              ],
                            }}
                          />
                          <Text className="ml-4 text-lg font-normal text-gray-500">
                            {windDegString}
                          </Text>
                        </View>
                      ),
                      temp_new: (
                        <Text className="text-gray-500 font-normal text-lg">
                          {v?.currentWeather?.main?.temp.toFixed(0)}°
                        </Text>
                      ),
                    };

                  const leftDesc = leftDescMap[selectedLayer] ?? null;
                  const rightDesc = rightDescMap[selectedLayer] ?? null;

                  return (
                    <Pressable
                      key={i}
                      className="px-6 justify-center mt-4"
                      hitSlop={5}
                      onPress={() =>
                        moveToSelectedLocation(
                          v?.coords?.latitude,
                          v?.coords?.longitude
                        )
                      }
                    >
                      <View className="flex-row justify-between items-center">
                        {/* left */}
                        <View>
                          {/* Location name */}
                          <Text className="text-lg">{v?.cityName}</Text>
                          {leftDesc}
                        </View>

                        {/* right */}
                        <View>{rightDesc}</View>
                      </View>

                      {/* hr */}
                      {i + 1 < sortedCities.length ? (
                        <View className="w-full h-[1px] bg-slate-200 mt-4" />
                      ) : (
                        <View className="mt-3" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        }
      </View>
    </SafeAreaView>
  );
}
