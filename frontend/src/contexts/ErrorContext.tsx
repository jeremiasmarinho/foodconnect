import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ToastContainer, ToastType } from "../components/ui/Toast";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

interface ErrorContextType {
  showError: (error: unknown, retry?: () => void) => void;
  showSuccess: (
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
  showWarning: (
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
  showInfo: (
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = genId();
    setToasts((prev) => [{ id, ...toast }, ...prev]);
  }, []);

  const parseError = (error: unknown): { title: string; message?: string } => {
    // Axios-like error support and generic fallback
    const anyErr = error as any;
    const responseMsg = anyErr?.response?.data?.message;
    const message =
      typeof responseMsg === "string"
        ? responseMsg
        : anyErr?.message || String(error);
    return { title: "Ocorreu um erro", message };
  };

  const showError = useCallback(
    (error: unknown, retry?: () => void) => {
      const { title, message } = parseError(error);
      pushToast({
        type: "error",
        title,
        message,
        duration: 5000,
        actionLabel: retry ? "Tentar novamente" : undefined,
        onAction: retry,
      });
    },
    [pushToast]
  );

  const showSuccess = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      pushToast({
        type: "success",
        title: "Sucesso",
        message,
        duration: 3000,
        actionLabel,
        onAction,
      });
    },
    [pushToast]
  );

  const showWarning = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      pushToast({
        type: "warning",
        title: "Atenção",
        message,
        duration: 4000,
        actionLabel,
        onAction,
      });
    },
    [pushToast]
  );

  const showInfo = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      pushToast({
        type: "info",
        title: "Info",
        message,
        duration: 3000,
        actionLabel,
        onAction,
      });
    },
    [pushToast]
  );

  const value = useMemo<ErrorContextType>(
    () => ({ showError, showSuccess, showWarning, showInfo }),
    [showError, showSuccess, showWarning, showInfo]
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
      {/* Toast overlay */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </ErrorContext.Provider>
  );
};

export const useErrorContext = (): ErrorContextType => {
  const ctx = useContext(ErrorContext);
  if (!ctx)
    throw new Error("useErrorContext must be used within ErrorProvider");
  return ctx;
};
