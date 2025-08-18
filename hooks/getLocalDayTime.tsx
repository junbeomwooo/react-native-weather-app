export interface CurrnetWeatherData {
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

export default function getLocalDayTime(currentWeather:CurrnetWeatherData | null) {
if (!currentWeather) return {sunrise:0, sunset:0};
  /** Timezone */
const timezoneOffset = currentWeather?.timezone ?? 0;

/** Local sunrise time */
const sunriseLocalDate = new Date(
  (currentWeather?.sys?.sunrise + timezoneOffset) * 1000
);
const sunrise = sunriseLocalDate.getUTCHours();

/** Local sunset time */
const sunsetLocalDate = new Date(
  (currentWeather?.sys?.sunset + timezoneOffset) * 1000
);
const sunset = sunsetLocalDate.getUTCHours();

/** Local now time */
const nowUtcSeconds = Math.floor(Date.now() / 1000);
const localHour = new Date((nowUtcSeconds + timezoneOffset) * 1000).getUTCHours();

/** Tell wheater its day or night */
const isNight = localHour >= sunset || localHour < sunrise;

return {sunrise, sunset, localHour, isNight}
}