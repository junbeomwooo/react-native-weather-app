import { useRouter } from "expo-router";
import { Dimensions, ImageBackground, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Map() {
  /** API key */
  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  const z = 0; // zoom level
  const x = 0; // tile x
  const y = 0; // tile y
  const url = `https://tile.openweathermap.org/map/clouds_new/${z}/${x}/${y}.png?appid=${WEATHER_API_KEY}`;

  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;

  const router = useRouter();

  return (
    <SafeAreaView className="bg-black">
      <ImageBackground
        source={{ uri: url }}
        style={{
          width: WINDOW_WIDTH,
          height: WINDOW_HEIGHT,
          backgroundColor: "black",
        }}
      >
        {/* Done */}
        <Pressable
          className="w-[70px] h-[35px] bg-white justify-center items-center mt-4 ml-4"
          onPress={() => router.back()}
        >
          <Text className=" text-xl">Done</Text>
        </Pressable>
      </ImageBackground>
    </SafeAreaView>
  );
}
