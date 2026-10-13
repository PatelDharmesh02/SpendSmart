import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import { spendApi } from "./api";

export const store = configureStore({
  reducer: {
    user: userReducer,
    [spendApi.reducerPath]: spendApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(spendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
