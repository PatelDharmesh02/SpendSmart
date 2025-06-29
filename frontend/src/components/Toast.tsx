import { useCallback, useEffect, useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { CloseCircle } from "iconsax-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

// Animations for the toasts
const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(100%); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const slideOut = keyframes`
  from { 
    opacity: 1; 
    transform: translateX(0); 
  }
  to { 
    opacity: 0; 
    transform: translateX(100%); 
  }
`;

// Using $isClosing as transient prop to avoid React DOM warnings
const ToastWrapper = styled.div<{
  type: ToastType;
  $isClosing: boolean;
}>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.textInverted};
  font-size: 0.875rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.shadow.md};
  animation: ${({ $isClosing }) => ($isClosing ? slideOut : slideIn)} 0.3s
    ease-in-out;
  background-color: ${({ type, theme }) => {
    switch (type) {
      case "success":
        return theme.success;
      case "error":
        return theme.danger;
      case "warning":
        return theme.warning;
      case "info":
      default:
        return theme.info;
    }
  }};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: transparent;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: ${({ theme }) => `0 ${theme.spacing.xs}`};
  margin-left: ${({ theme }) => theme.spacing.sm};
  opacity: 0.8;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &:focus {
    opacity: 1;
    outline: none;
  }
`;

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { id, type, message: content, duration = 3000 } = message;
  const theme = useTheme();

  const handleClose = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  }, [id, isClosing, onClose]);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!isVisible) return null;

  return (
    <ToastWrapper
      type={type}
      $isClosing={isClosing}
      role="alert"
      aria-live="assertive"
    >
      <span>{content}</span>
      <CloseButton
        onClick={handleClose}
        aria-label="Close notification"
        type="button"
      >
        <CloseCircle size={24} color={theme.textInverted} />
      </CloseButton>
    </ToastWrapper>
  );
};

export default Toast;
