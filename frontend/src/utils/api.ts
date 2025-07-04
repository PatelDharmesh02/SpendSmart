import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AppError } from "./errorHandler";

const baseURL =
  process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:5000/api/v1";

const instance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Create standardized error object
    const errorData = error.response?.data as Record<string, unknown>;
    const statusCode = error.response?.status;

    // Extract meaningful error message from various sources
    let errorMessage = "An unexpected error occurred";

    // Try to get message from response data
    if (errorData?.detail) {
      errorMessage = errorData.detail as string;
    }
    // Try to get error from standard error message
    else if (error.message) {
      errorMessage = error.message;

      // Clean up axios error messages
      if (errorMessage.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }
    }
    // Handle validation errors (typical 400 Bad Request with field errors)
    let fieldErrors: Record<string, unknown> = {};
    if (statusCode === 400 || statusCode === 422) {
      if (errorData?.detail) {
        fieldErrors = errorData;
      }
    }

    // Create a structured error response that's easier to handle in UI
    return Promise.reject({
      message: errorMessage,
      type: "api",
      status: statusCode,
      data: errorData,
      fieldErrors,
      originalError: error,
    } as AppError);
  }
);

export default instance;
