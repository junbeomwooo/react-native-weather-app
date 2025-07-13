import { ThemeContext } from "@/context/ThemeContext";

import { Fragment, useContext, useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, TextInput } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { theme } = useContext(ThemeContext);

  const WINDOW_WIDTH = Dimensions.get("window").width;

  const [cities, setCities] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const address = await AsyncStorage.getItem("location");
      console.log(address);
    };
    getData();
  }, []);

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

      {cities?.length > 0 ? (<Fragment></Fragment>):(<Fragment></Fragment>)}
      
    </ScrollView>
  );
}
