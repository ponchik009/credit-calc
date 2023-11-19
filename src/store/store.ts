import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { enableMapSet } from "immer";

import creditReducer from "./creaditSlice/creditSlice";

enableMapSet();

export const store = configureStore({
  reducer: {
    credit: creditReducer,
  },
  // отключаем чек сериализации
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
