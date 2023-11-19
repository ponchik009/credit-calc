import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import ru from "date-fns/locale/ru";

import { store } from "./store/store";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Provider store={store}>
        <App />
      </Provider>
    </LocalizationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
