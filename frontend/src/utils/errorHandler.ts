import axios, { AxiosError } from "axios";
import { useToast } from "@/lib/ToasteContext";

export type ErrorType = "api" | "validation" | "auth" | "network" | "unknown";

export interface AppError {
  message: string;
  type: ErrorType;
  status?: number;
  data?: Record<string, unknown>;
  originalError?: AxiosError | Error;
  fieldErrors?: Record<string, unknown>;
}

/**
 * Check if an unknown object conforms to the AppError interface
 */
function isAppError(obj: unknown): obj is AppError {
  if (!obj || typeof obj !== "object") return false;

  const err = obj as Partial<AppError>;
  return (
    typeof err.message === "string" &&
    (err.type === "api" ||
      err.type === "validation" ||
      err.type === "auth" ||
      err.type === "network" ||
      err.type === "unknown")
  );
}

/**
 * Parses any type of error and returns a standardized AppError object
 */
export function parseError(error: unknown): AppError {
  // First check if error is already in AppError format (from interceptors or elsewhere)
  if (isAppError(error)) {
    // Already in the correct format, return as is
    return error;
  }
  // Handle Axios errors - use isAxiosError helper instead of instanceof
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Extract message from response data - check for 'detail' field first (common Django/FastAPI pattern)
    let errorMessage = "";
    const responseData = error.response?.data;

    if (responseData) {
      errorMessage =
        responseData.detail || responseData.message || responseData.error;
    }

    if (!errorMessage) {
      errorMessage = error.message || "An unexpected error occurred";
    }

    // Handle different types of API errors based on status code
    if (status) {
      // Auth errors
      if (status === 401 || status === 403) {
        return {
          message: errorMessage || "Authentication error",
          type: "auth",
          status,
          originalError: error,
          data: error.response?.data,
        };
      }

      // Validation errors
      if (status === 400 || status === 422) {
        return {
          message: errorMessage || "Validation error",
          type: "validation",
          status,
          originalError: error,
          data: error.response?.data,
        };
      }

      // Server errors
      if (status >= 500) {
        return {
          message: "Server error. Please try again later.",
          type: "api",
          status,
          originalError: error,
        };
      }
    }

    // Network errors
    if (
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout") ||
      !error.response
    ) {
      return {
        message: "Network error. Please check your connection and try again.",
        type: "network",
        originalError: error,
      };
    }

    // Generic API error
    return {
      message: errorMessage || "An unexpected API error occurred",
      type: "api",
      status: error.response?.status,
      originalError: error,
      data: error.response?.data,
    };
  }

  // Handle standard JS errors
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      type: "unknown",
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      type: "unknown",
    };
  }

  // Handle unknown error types
  return {
    message: "An unexpected error occurred",
    type: "unknown",
    originalError: error as Error | AxiosError,
  };
}

/**
 * Hook to handle errors with automatic toast notifications
 */
export function useErrorHandler() {
  const { showToast } = useToast();

  const handleError = (
    error: unknown,
    options?: {
      showToast?: boolean;
      prefix?: string;
      fallbackMessage?: string;
    }
  ) => {
    const {
      showToast: shouldShowToast = true,
      prefix = "",
      fallbackMessage,
    } = options || {};
    const appError = parseError(error);
    const displayMessage = prefix
      ? `${prefix}: ${appError.message}`
      : appError.message || fallbackMessage || "An unexpected error occurred";

    if (shouldShowToast) {
      // Map error types to toast types
      const toastType = appError.type === "validation" ? "warning" : "error";
      showToast(displayMessage, toastType);
    }

    return appError;
  };

  return { handleError, parseError };
}

/**
 * Function to handle errors without hooks (for use in Redux thunks, etc.)
 */
export function handleErrorWithoutHook(
  error: AppError,
  showToastFn?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void,
  options?: {
    prefix?: string;
    fallbackMessage?: string;
  }
) {
  const { prefix = "", fallbackMessage } = options || {};
  const displayMessage = prefix
    ? `${prefix}: ${error.message}`
    : error.message || fallbackMessage || "An unexpected error occurred";

  // Show toast if function was provided
  if (showToastFn) {
    const toastType = error.type === "validation" ? "warning" : "error";
    showToastFn(displayMessage, toastType);
  }

  return error;
}
