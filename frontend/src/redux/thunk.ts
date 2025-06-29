import { createAsyncThunk } from "@reduxjs/toolkit";
import AxiosInstance from "@/utils/api";
import { loginUser, setUserError, setUserLoading } from "./slices/userSlice";
import {
  LoginUserPayload,
  RegisterUserPayload,
  UserResponse,
} from "@/types/user.types";
import { AppError, parseError } from "@/utils/errorHandler";
import { Budget, BudgetCreate } from "@/types/budget.type";
import {
  addBudget,
  removeBudget,
  setBudgetError,
  setBudgetLoading,
  updateBudget,
} from "./slices/budgetSlice";

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const response = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(response.data as UserResponse));
      return response.data;
    } catch (error: unknown) {
      const appError = parseError(error);
      dispatch(setUserError(`Failed to fetch user data: ${appError.message}`));
      // Explicitly throw to allow error handling with unwrap()
      throw appError as AppError;
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleLogin = createAsyncThunk(
  "user/loginUser",
  async ({ email, password, routeHandler }: LoginUserPayload, { dispatch }) => {
    dispatch(setUserLoading(true));
    try {
      const res = await AxiosInstance.post("/auth/login", { email, password });
      const authToken = res.data.access_token;
      localStorage.setItem("token", authToken);
      const userResponse = await AxiosInstance.get("/auth/me");
      dispatch(loginUser(userResponse.data as UserResponse));
      routeHandler?.("/dashboard");

      return userResponse.data;
    } catch (error: unknown) {
      // Use our error parsing utility
      const appError = parseError(error);
      dispatch(setUserError(`Login failed: ${appError.message}`));

      // Explicitly throw to allow error handling with unwrap()
      throw appError as AppError;
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleRegister = createAsyncThunk(
  "user/registerUser",
  async (
    { name, email, password, routeHandler }: RegisterUserPayload,
    { dispatch }
  ) => {
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
      routeHandler?.("/dashboard");
      return userResponse.data;
    } catch (error: unknown) {
      // Use our error parsing utility for consistent error handling
      const appError = parseError(error);
      dispatch(setUserError(`Registration failed: ${appError.message}`));

      // Explicitly throw to allow error handling with unwrap()
      throw appError as AppError;
    } finally {
      dispatch(setUserLoading(false));
    }
  }
);

export const handleAddBudget = createAsyncThunk(
  "budget/addBudget",
  async (budget: BudgetCreate, { dispatch }) => {
    dispatch(setBudgetLoading(true));
    try {
      const res = await AxiosInstance.post("/budgets", budget);
      dispatch(addBudget(res.data));
      return res.data;
    } catch (error: unknown) {
      const appError = parseError(error);
      dispatch(setBudgetError(`Failed to add budget: ${appError.message}`));
      throw appError as AppError;
    } finally {
      dispatch(setBudgetLoading(false));
    }
  }
);

export const handleUpdateBudget = createAsyncThunk(
  "budget/updateBudget",
  async (budget: Budget, { dispatch }) => {
    dispatch(setBudgetLoading(true));
    try {
      const res = await AxiosInstance.put(`/budgets/${budget.id}`, budget);
      dispatch(updateBudget(res.data));
      return res.data;
    } catch (error: unknown) {
      const appError = parseError(error);
      dispatch(setBudgetError(`Failed to update budget: ${appError.message}`));
      throw appError as AppError;
    } finally {
      dispatch(setBudgetLoading(false));
    }
  }
);

export const handleDeleteBudget = createAsyncThunk(
  "budget/deleteBudget",
  async (budgetId: string, { dispatch }) => {
    dispatch(setBudgetLoading(true));
    try {
      await AxiosInstance.delete(`/budgets/${budgetId}`);
      dispatch(removeBudget(budgetId));
      return budgetId;
    } catch (error: unknown) {
      const appError = parseError(error);
      dispatch(setBudgetError(`Failed to delete budget: ${appError.message}`));
      throw appError as AppError;
    } finally {
      dispatch(setBudgetLoading(false));
    }
  }
);
