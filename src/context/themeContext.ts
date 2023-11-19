import { createContext } from "react";

export type ThemeContextType = "light" | "dark";

export type ThemeContextState = {
  theme: ThemeContextType;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextState>({
  theme: "light",
  toggle: () => {},
});
