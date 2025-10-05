import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import ErrorToast from "../components/ErrorToast/ErrorToast";
import { getErrorMessage, shouldRetry } from "../services/api/interceptors";

interface ErrorContextType {
  showError: (error: any, retryAction?: () => void) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  clearError: () => void;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: "error" | "warning" | "info" | "success";
  retryAction?: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "error",
  });

  const showToast = useCallback(
    (
      message: string,
      type: "error" | "warning" | "info" | "success",
      retryAction?: () => void
    ) => {
      setToast({
        visible: true,
        message,
        type,
        retryAction,
      });
    },
    []
  );

  const showError = useCallback(
    (error: any, retryAction?: () => void) => {
      const message = getErrorMessage(error);
      const canRetry = shouldRetry(error) && retryAction;

      showToast(message, "error", canRetry ? retryAction : undefined);
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, "warning");
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast]
  );

  const clearError = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleRetry = useCallback(() => {
    if (toast.retryAction) {
      clearError();
      toast.retryAction();
    }
  }, [toast.retryAction, clearError]);

  const value: ErrorContextType = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={clearError}
        onRetry={toast.retryAction ? handleRetry : undefined}
      />
    </ErrorContext.Provider>
  );
};

export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorContext must be used within an ErrorProvider");
  }
  return context;
};
