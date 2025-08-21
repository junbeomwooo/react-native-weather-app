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
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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

  /** Context */
  const { myLocationWeather } = useContext(LocationContext);

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

  /** Move to Current Location */
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

  return (
    <SafeAreaView
      className={`${theme === "light" ? "bg-white" : "bg-black"} flex-1`}
    >
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
            {isLayerListOpen === true && (
              <View className="w-[210px] h-auto bg-slate-100 mt-4 rounded-lg px-4">
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
              </View>
            )}
          </View>
        </View>

        {/* Weather Info list (On/Off) */}
        {isWeatherInfoOpen && (
          <View className="w-full h-1/2 bg-slate-100 absolute bottom-0 pt-5">
            {/* Header */}
            <View className="flex-row justify-between items-center px-7">
              {/* Icons and Title */}
              <View className="flex-row items-center">
                {/* Icons */}
                <View className="mr-[12px]">{weatherIcon}</View>
                {/* Weather desc */}
                <View>
                  <Text className="font-semibold text-lg">{layerOption}</Text>
                  <Text className="text-sm font-medium text-gray-400">
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

            {/* <View className="w-full bg-gray-200 h-[1px] mt-5"/> */}

            <View className="bg-white mx-7 mt-4 rounded-xl">
              {asyncData?.map((v, i) => {
                console.log(v);
                const clouds = null;
                const precipitation = null;
                const pressure = null;
                const wind = null;
                const temeperature = null;

                return (
                  <View key={i} className="px-6 justify-center mt-3">
                    {/* left */}
                    <View>
                      {/* Location name */}
                      <Text className="text-lg">
                        {v?.myLocation === true ? "My Location" : v?.cityName}
                        {}
                      </Text>
                    </View>

                    {/* right */}
                    <View></View>

                    {/* hr */}
                    {i + 1 < asyncData.length ? (
                      <View className="w-full h-[1px] bg-slate-200 mt-3" />
                    ) : (
                      <View className="mt-3" />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
