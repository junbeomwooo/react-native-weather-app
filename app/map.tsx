import { LocationContext } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useContext, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

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

  const { theme } = useContext(ThemeContext);
  const {
    latlng: [lat, lng],
  } = useContext(LocationContext);

  const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } =
    Dimensions.get("window");

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
            latitudeDelta: 6.5,
            longitudeDelta: 6.5,
          }}
          ref={mapRef}
        >
          {/* Tile */}
          <UrlTile
            urlTemplate={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`}
          />
        </MapView>

        {/* Content */}
        <View className="flex-row justify-between absolute w-full px-4 pt-4">
          {/* Done */}
          <Pressable
            className="w-[70px] h-[47px] bg-white justify-center items-center rounded-lg"
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
              className="w-[47px] h-[47px] bg-white justify-center items-center rounded-lg"
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
              className="w-[47px] h-[47px] bg-white justify-center items-center rounded-lg mt-3"
            >
              <Entypo name="menu" size={23} color="black" />
            </Pressable>
            {/* layer list */}
            <Pressable
              hitSlop={5}
              className="w-[47px] h-[47px] bg-white justify-center items-center rounded-lg mt-3"
              onPress={() => setLayerListOpen((prev) => !prev)}
            >
              <Octicons name="stack" size={20} color="black" />
            </Pressable>
            {isLayerListOpen === true && (
              <View className="w-[200px] h-auto bg-white mt-4 rounded-lg px-4">

                {/* Clouds */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                >
                  <Text className="text-lg">Clouds</Text>
                  <Ionicons name="cloud-outline" size={24} color="black" />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/* Precipitation */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                >
                  <Text className="text-lg">Precipitation</Text>
                  <Ionicons name="umbrella-outline" size={24} color="black" />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/*Pressure */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                >
                  <Text className="text-lg">Pressure</Text>
                  <MaterialCommunityIcons
                    name="waves"
                    size={24}
                    color="black"
                  />
                </Pressable>
                {/* Hr */}
                <View className="w-full h-[0.5px] bg-gray-100" />

                {/* Wind speed */}
                <Pressable
                  className="flex-row justify-between py-3"
                  hitSlop={5}
                >
                  <Text className="text-lg">Wind speed</Text>
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
                >
                  <Text className="text-lg">Temperature</Text>
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
      </View>
    </SafeAreaView>
  );
}
