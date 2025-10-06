import { useState, useCallback } from "react";
import { ToastType } from "../components/ui/Toast";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, options?: Partial<ToastItem>) => {
      showToast({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, options?: Partial<ToastItem>) => {
      showToast({
        type: "error",
        title,
        message,
        duration: 6000, // Longer duration for errors
        ...options,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, options?: Partial<ToastItem>) => {
      showToast({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, options?: Partial<ToastItem>) => {
      showToast({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };
};
