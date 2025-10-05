import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { getErrorMessage, shouldRetry } from "../services/api/interceptors";

interface UseErrorHandlerReturn {
  error: string | null;
  hasError: boolean;
  showError: (error: any) => void;
  clearError: () => void;
  retryAction: (() => void) | null;
  setRetryAction: (action: (() => void) | null) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const showError = useCallback(
    (errorData: any) => {
      const message = getErrorMessage(errorData);
      setError(message);

      // Show alert for immediate feedback
      if (shouldRetry(errorData) && retryAction) {
        Alert.alert("Erro", message, [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Tentar Novamente",
            onPress: () => {
              clearError();
              retryAction();
            },
          },
        ]);
      } else {
        Alert.alert("Erro", message, [{ text: "OK" }]);
      }
    },
    [retryAction]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    showError,
    clearError,
    retryAction,
    setRetryAction,
  };
};
