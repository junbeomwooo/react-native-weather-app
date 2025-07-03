import { createContext } from "react";

export const ThemeContext = createContext<"light" | "dark" | null>(null);

export default function ThemeProvider() {
  return (
  <ThemeContext value="dark">
    {children}
  </ThemeContext>
  );
}
