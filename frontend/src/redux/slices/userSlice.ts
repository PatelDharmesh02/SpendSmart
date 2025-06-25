import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { UserState, UserResponse } from "@/types/user.types";

const initialState: UserState = {
  id: null,
  email: null,
  name: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginUser: (state, action: PayloadAction<UserResponse>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.id = null;
      state.email = null;
      state.name = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginUser, logoutUser, setUserLoading, setUserError } =
  userSlice.actions;
export default userSlice.reducer;

export const userEmailSelector = (state: RootState) => state.user.email;
export const userNameSelector = (state: RootState) => state.user.name;
export const userAuthenticatedSelector = (state: RootState) =>
  state.user.isAuthenticated;
export const userLoadingSelector = (state: RootState) => state.user.isLoading;
export const userErrorSelector = (state: RootState) => state.user.error;
