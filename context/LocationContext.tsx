import { createContext, ReactNode, useState } from "react";

export interface WeatherData {
  base: string;
  clouds: { all: number };
  cod: number;
  coord: { lat: number; lon: number };
  dt: number;
  id: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
    id: number;
    sunrise: number;
    sunset: number;
    type: number;
  };
  timezone: number;
  visibility: number;
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[];
  wind: { deg: number; speed: number };
}

export type LocationType = {
  latlng: [number, number];
  setLatLng: React.Dispatch<React.SetStateAction<[number, number]>>;
  myLocationWeather: WeatherData | null,
  setMyLocationWeather: React.Dispatch<React.SetStateAction<WeatherData | null>>;
};


export const LocationContext = createContext<LocationType>({
  latlng: [0, 0],
  setLatLng: () => {},
  myLocationWeather:null,
  setMyLocationWeather: () => {}
});

export function LocationProvider({children}:{ children: ReactNode }) {
  const [latlng, setLatLng] = useState<[number, number]>([0, 0]);
  const [myLocationWeather, setMyLocationWeather] = useState<WeatherData | null>(null);

  return (
  <LocationContext.Provider value={{latlng, setLatLng, myLocationWeather, setMyLocationWeather}}>
    {children}
  </LocationContext.Provider>
  );
}
