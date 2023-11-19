import React from "react";

import { Button } from "@mui/material";

import { ThemeContext, ThemeContextState } from "../../context/themeContext";

export const ChangeThemeSwitch = () => {
  const { toggle } = React.useContext<ThemeContextState>(ThemeContext);

  return (
    <Button
      variant="outlined"
      sx={{ position: "absolute", top: "5%", left: "5%" }}
      onClick={toggle}
    >
      Поменять тему
    </Button>
  );
};
