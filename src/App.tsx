import React from "react";

import { CssBaseline } from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import "./App.css";

import { ThemeContext, ThemeContextType } from "./context/themeContext";

import { ChangeThemeSwitch } from "./components/ChangeThemeSwitch/ChangeThemeSwitch";

import { Storage } from "./utils/localStorage";
import { CountCreditSection } from "./components/CountCreditSection/CountCreditSection";
import { CreditSummarySection } from "./components/CreditSummarySection/CreditSummarySection";

function App() {
  const [theme, setTheme] = React.useState<ThemeContextType>(
    (Storage.get(Storage.THEME_KEY) as ThemeContextType) || "dark"
  );

  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
    components: {
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            padding: "8px 16px",
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => {
          const newTheme = theme === "light" ? "dark" : "light";
          setTheme(newTheme);
          Storage.save(Storage.THEME_KEY, newTheme);
        },
      }}
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ChangeThemeSwitch />
        <div className="App">
          <CountCreditSection />
          <CreditSummarySection />
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
