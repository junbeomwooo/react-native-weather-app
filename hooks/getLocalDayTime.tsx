export default function getLocalDayTime(currentWeather:any) {
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