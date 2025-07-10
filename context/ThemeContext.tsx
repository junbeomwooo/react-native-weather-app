import { createContext } from "react";

export type Theme = {
  theme: "light" | "dark" | null;
  sunrise: number | null;
  sunset: number | null;
  setSunrise: (v: number) => void;
  setSunset: (v: number) => void;
};

export const ThemeContext = createContext<Theme>({
  theme: null,
  sunrise: null,
  sunset: null,
  setSunrise: () => {},
  setSunset: () => {},
});
