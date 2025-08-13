import { LocationContext } from "@/context/LocationContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Dimensions, Pressable, Text } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Map() {
  /** API key */
  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const router = useRouter();

  const { theme } = useContext(ThemeContext);
  const {
    latlng: [lat, lng],
  } = useContext(LocationContext);

  return (
    <SafeAreaView
      className={`${theme === "light" ? "bg-white" : "bg-black"} flex-1`}
    >
      {/* Map */}
      <MapView
        style={{ flex: 1}}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 6.5,
          longitudeDelta: 6.5,
        }}
      >
        {/* Tile */}
        <UrlTile
          urlTemplate={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`}
        />
        {/* Done */}
        <Pressable
          className="w-[70px] h-[35px] bg-white justify-center items-center mt-4 ml-4"
          onPress={() => router.back()}
        >
          <Text className=" text-xl">Done</Text>
        </Pressable>
      </MapView>
    </SafeAreaView>
  );
}
