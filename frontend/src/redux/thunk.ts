import { createAsyncThunk } from "@reduxjs/toolkit";
import AxiosInstance from "@/utils/api";
import { loginUser, setUserError, setUserLoading } from "./slices/userSlice";

type UserData = {
  email: string;
  password: string;
};

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const response = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(response.data));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setUserError("Failed to fetch user data: " + error.message));
      }
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleLogin = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }: UserData, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const res = await AxiosInstance.post("/auth/login", { email, password });
      const userData = res.data;
      localStorage.setItem("token", userData.token);
      dispatch(loginUser(userData));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setUserError("Login failed: " + error.message));
      }
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);
