import React, { createContext, useContext, useState } from "react";
import Toast, { ToastMessage, ToastType } from "@/components/Toast";
import styled from "styled-components";

interface ToastOptions {
  duration?: number;
  id?: string;
}

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastType,
    options?: ToastOptions
  ) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;

  showSuccess: (message: string, options?: ToastOptions) => string;
  showError: (message: string, options?: ToastOptions) => string;
  showWarning: (message: string, options?: ToastOptions) => string;
  showInfo: (message: string, options?: ToastOptions) => string;

  toasts: ToastMessage[];
}

const ToastWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: fit-content;
  width: 100%;
`;

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hideToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  const clearAllToasts = () => {
    setToasts([]);
  };

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  };
  const showToast = (
    message: string,
    type: ToastType,
    options?: ToastOptions
  ): string => {
    const id = options?.id || generateId();
    const duration = options?.duration || 3000;

    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);
    return id;
  };

  const showSuccess = (message: string, options?: ToastOptions): string => {
    return showToast(message, "success", options);
  };

  const showError = (message: string, options?: ToastOptions): string => {
    return showToast(message, "error", options);
  };

  const showWarning = (message: string, options?: ToastOptions): string => {
    return showToast(message, "warning", options);
  };

  const showInfo = (message: string, options?: ToastOptions): string => {
    return showToast(message, "info", options);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        clearAllToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toasts,
      }}
    >
      {children}
      <ToastWrapper>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onClose={hideToast} />
        ))}
      </ToastWrapper>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
