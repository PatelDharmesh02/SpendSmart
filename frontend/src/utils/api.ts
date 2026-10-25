import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { apiBaseUrl } from "@/lib/apiBase";
import { AppError } from "./errorHandler";
import { closeSession, isSessionClosed } from "@/lib/session";

const instance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isSessionClosed()) {
      return Promise.reject(new axios.Cancel("Session ended"));
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const errorData = error.response?.data as Record<string, unknown>;
    const statusCode = error.response?.status;
    const url = error.config?.url || "";
    const isCredentialCheck = url.includes("/auth/login") || url.includes("/auth/register");
    if (statusCode === 401 && !isCredentialCheck) {
      closeSession();
    }
    let errorMessage = "An unexpected error occurred";

    if (typeof errorData?.detail === "string") {
      errorMessage = errorData.detail;
    } else if (error.message) {
      errorMessage = error.message;
      if (errorMessage.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }
    }

    return Promise.reject({
      message: errorMessage,
      type: "api",
      status: statusCode,
      data: errorData,
      fieldErrors: statusCode === 400 || statusCode === 422 ? errorData : {},
      originalError: error,
    } as AppError);
  }
);

export default instance;
