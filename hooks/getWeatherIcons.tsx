
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  clear,
  clouds,
  drizzle,
  fewClouds,
  mist,
  rain,
  snow,
  storm,
} from "@/utils/weatherIcon";


export  function getCurrentWeatherIcons(
  weatherId: number,
  size: number,
  theme: "light" | "dark" | null
) {
  /** weahter code list */

  const storm = [200, 201, 202, 210, 211, 212, 221, 230, 231, 232];

  const drizzle = [300, 301, 302, 310, 311, 312, 313, 314, 321];

  const rain = [500, 501, 502, 503, 504, 520, 521, 522, 531];

  const snow = [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622, 511];

  const mist = [701, 711, 721, 731, 741, 751, 761, 762, 771, 781];

  const clear = [800];

  const fewClouds = [801, 802];

  const clouds = [803, 804];

  if (storm?.includes(weatherId)) {
    return (
      <Ionicons
        name="thunderstorm-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (drizzle?.includes(weatherId) || rain?.includes(weatherId)) {
    return (
      <Ionicons
        name="rainy-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (snow?.includes(weatherId)) {
    return (
      <Ionicons
        name="snow-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (mist?.includes(weatherId)) {
    return (
      <MaterialCommunityIcons
        name="weather-fog"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (clear?.includes(weatherId)) {
    const clear =
      theme === "light" ? (
        <Fontisto name="day-sunny" size={size} color="black" />
      ) : (
        <Ionicons name="moon-outline" size={size} color="white" />
      );
    return clear;
  } else if (fewClouds?.includes(weatherId)) {
    const fewClouds =
      theme === "light" ? (
        <Ionicons
          name="partly-sunny-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      ) : (
        <Ionicons name="cloudy-night-outline" size={size} color="white" />
      );

    return fewClouds;
  } else if (clouds?.includes(weatherId)) {
    return (
      <Ionicons
        name="cloud-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
        className="mb-[-20px]"
      />
    );
  }
}


export  function getWeatherIconsByTime(
  weatherId: number,
  hours: number,
  size: number,
  sunset: any,
  sunrise: any,
  theme:"light" | "dark" | null
) {


  if (storm?.includes(weatherId)) {
    return (
      <Ionicons
        name="thunderstorm-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (drizzle?.includes(weatherId) || rain?.includes(weatherId)) {
    return (
      <Ionicons
        name="rainy-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (snow?.includes(weatherId)) {
    return (
      <Ionicons
        name="snow-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (mist?.includes(weatherId)) {
    return (
      <MaterialCommunityIcons
        name="weather-fog"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  } else if (clear?.includes(weatherId)) {
    const clear =
      // when its after sunset
      hours >= sunset || hours < sunrise ? (
        <Ionicons
          name="moon-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      ) : (
        // when its before sunset
        <Fontisto
          name="day-sunny"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    return clear;
  } else if (fewClouds?.includes(weatherId)) {
    const fewClouds =
      // when its after sunset
      hours >= sunset || hours < sunrise ? (
        <Ionicons
          name="cloudy-night-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      ) : (
        // when its before sunset
        // when its before sunset
        <Ionicons
          name="partly-sunny-outline"
          size={size}
          color={theme === "light" ? "black" : "white"}
        />
      );
    return fewClouds;
  } else if (clouds?.includes(weatherId)) {
    return (
      <Ionicons
        name="cloud-outline"
        size={size}
        color={theme === "light" ? "black" : "white"}
      />
    );
  }
}
