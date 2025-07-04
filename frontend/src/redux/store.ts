import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import transactionReducer from "./slices/transactionSlice";
import budgetReducer from "./slices/budgetSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
