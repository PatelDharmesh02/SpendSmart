import { createAsyncThunk } from "@reduxjs/toolkit";
import AxiosInstance from "@/utils/api";
import {
  loginUser,
  setUserError,
  setUserLoading,
  logoutUser,
} from "./slices/userSlice";
import {
  LoginUserPayload,
  RegisterUserPayload,
  UserResponse,
} from "@/types/user.types";

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const response = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(response.data as UserResponse));
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
  async ({ email, password }: LoginUserPayload, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const res = await AxiosInstance.post("/auth/login", { email, password });
      const authToken = res.data.access_token;
      localStorage.setItem("token", authToken);
      const userResponse = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(userResponse.data as UserResponse));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setUserError("Login failed: " + error.message));
      }
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleLogout = createAsyncThunk(
  "user/logoutUser",
  async (_, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      localStorage.removeItem("token");
      dispatch(logoutUser());
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setUserError("Logout failed: " + error.message));
      }
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleRegister = createAsyncThunk(
  "user/registerUser",
  async ({ name, email, password }: RegisterUserPayload, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const res = await AxiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      const authToken = res.data.access_token;
      localStorage.setItem("token", authToken);
      const userResponse = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(userResponse.data as UserResponse));
      return userResponse.data;
    } catch (error: any) {
      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);
