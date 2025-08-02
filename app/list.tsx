import { EditContext } from "@/context/EditContext";
import { ThemeContext } from "@/context/ThemeContext";

import { Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import major_cities from "@/assets/major_cities_200.json";
import { LinearGradient } from "expo-linear-gradient";

import getLocalDayTime from "@/hooks/getLocalDayTime";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function List() {
  /** Global context state  */
  const { theme } = useContext(ThemeContext);
  const editContext = useContext(EditContext);
  if (!editContext)
    throw new Error("EditContext must be used within EditProvider");
  const { isEditOpen } = editContext;

  /** router */
  const router = useRouter();

  /** The width and height for device */
  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").width;

  /** Data for favorite cities */
  const [cities, setCities] = useState([{}]);

  /** Capitalize function */
  const capitalizeDesc = (desc: string) => {
    if (!desc) return "";

    return desc
      ?.split(" ")
      ?.map((v) => v?.charAt(0)?.toUpperCase() + v?.slice(1))
      .join(" ");
  };

  /** Recieve asnyce storage data */
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

        setCities(parsed);
      } catch (error) {
        console.error("Failed to load all cities:", error);
      }
    };
    getData();
  }, []);

  /** Auto Complete  */

  const [searchInput, setSearchInput] = useState("");
  const [filterCities, setFilteredCities] = useState<
    { id: number; name: string }[]
  >([]);

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

  /** Linear Gradient Animation */

  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: { x: -WINDOW_WIDTH / 2, y: -WINDOW_HEIGHT / 4 },
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: { x: 0, y: 0 },
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [WINDOW_HEIGHT, translate, WINDOW_WIDTH]);

  // To sort the ‘myLocation’ city to the top
  const sortedCities = [...cities].sort((a: any, b: any) => {
    if (a.myLocation) return -1;
    if (b.myLocation) return 1;
    return 0;
  });

  return (
    <View
      className={`flex-1 px-6 ${
        theme === "light" ? "bg-[#fed500]" : "bg-[#080830]"
      }`}
      style={{
        width: WINDOW_WIDTH,
        alignItems: "center",
      }}
    >
      {filterCities?.length === 0 && (
        <Text
          className={`${
            theme === "light" ? "text-black" : "text-white"
          } text-[40px] font-bold text-start w-full`}
        >
          Weather
        </Text>
      )}

      <View className="w-full flex-1">
        <TextInput
          autoCapitalize={"words"}
          returnKeyType={"search"}
          className={`w-full h-12 rounded-xl px-4 my-5 text-lg leading-[20px] ${
            theme === "light"
              ? "bg-white text-black"
              : "bg-[#1c1c45] text-white"
          }`}
          maxLength={20}
          placeholder="Search for a city or country"
          onChangeText={onChangeText}
          placeholderTextColor="#888888"
        />

        {/* Show Filtered Cities */}
        {filterCities?.length > 0 && (
          <FlatList
            data={filterCities}
            renderItem={({ item }: { item: { id: number; name: string } }) => (
              <Pressable onPressIn={() => router.push(`/city/${item?.id}`)}>
                <Text
                  className={`${
                    theme === "light" ? "text-black" : "text-white"
                  } w-full my-2 mx-4 text-lg`}
                >
                  {item?.name}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item: any) => item?.id}
          />
        )}

        {/* Your favorite cities */}
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          {sortedCities?.length > 0 && filterCities?.length === 0 ? (
            sortedCities?.map((v: any, i: number) => {
              const { isNight } = getLocalDayTime(v);
              const desc = v?.weather?.[0]?.description ?? "";


              return (
                <View key={i} className="flex-row items-center flex-1">
                  {isEditOpen && !v?.myLocation &&  (
                    
                    <MaterialIcons
                      name="cancel"
                      size={30}
                      color="red"
                      className="mt-6 mr-3"
                    />
                  )}

                  <Pressable
                    className={`mt-6 rounded-2xl flex-row px-5 py-3 justify-between flex-1 ${isEditOpen ? "h-24" : "h-36"}`}
                    onPress={() =>
                      v?.myLocation === true
                        ? router.push("/")
                        : router.push(`/city/${v?.cityID}`)
                    }
                  >
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
                              ? [
                                  "#0a0a3c",
                                  "#1a237e",
                                  "#3f51b5",
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
                          } font-medium text-[12px] ${isEditOpen && "hidden"}`}
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
                          } font-medium text-[12px] ${isEditOpen && "hidden"}`}
                        >
                          Feels_like: {Math.round(v?.main?.feels_like)}°
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })
          ) : (
            <Fragment></Fragment>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
