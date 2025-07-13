import { ThemeContext } from "@/context/ThemeContext";

import { Fragment, useContext, useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, TextInput, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { theme } = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;

  const [cities, setCities] = useState([]);

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

  console.log(cities);

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
        } text-[45px] font-semibold text-start w-full`}
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

        
          return (
            <View
              className={`w-full h-36 border-[2px] mt-10 rounded-2xl ${
                theme === "light" ? "border-black" : "border-white"
              }`}
              key={i}
            >
              <Text>Hello</Text>
            </View>
          );
        })
      ) : (
        <Fragment></Fragment>
      )}
    </ScrollView>
  );
}
