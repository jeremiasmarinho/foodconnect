import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ActivityIndicator, View, Text, Modal } from "react-native";
import { useTheme } from "./ThemeProvider";

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showProgressLoading: (message: string, progress: number) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const showLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      message,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
    });
  }, []);

  const showProgressLoading = useCallback((message: string, progress: number) => {
    setLoadingState({
      isLoading: true,
      message,
      progress: Math.max(0, Math.min(100, progress)),
    });
  }, []);

  const contextValue: LoadingContextType = {
    showLoading,
    hideLoading,
    showProgressLoading,
    isLoading: loadingState.isLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Modal */}
      <Modal
        visible={loadingState.isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.layout.borderRadius.xl,
              padding: theme.spacing.xl,
              alignItems: "center",
              minWidth: 200,
              maxWidth: 280,
              ...theme.layout.shadow.large,
            }}
          >
            {/* Loading Indicator */}
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginBottom: theme.spacing.lg }}
            />

            {/* Progress Bar (if progress is provided) */}
            {typeof loadingState.progress === "number" && (
              <View
                style={{
                  width: "100%",
                  height: 4,
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 2,
                  marginBottom: theme.spacing.md,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${loadingState.progress}%`,
                    height: "100%",
                    backgroundColor: theme.colors.primary,
                    borderRadius: 2,
                  }}
                />
              </View>
            )}

            {/* Loading Message */}
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.medium,
                textAlign: "center",
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              {loadingState.message || "Carregando..."}
            </Text>

            {/* Progress Percentage */}
            {typeof loadingState.progress === "number" && (
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  marginTop: theme.spacing.sm,
                }}
              >
                {Math.round(loadingState.progress)}%
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// Hook for components to show loading with automatic cleanup
export const useAsyncOperation = () => {
  const { showLoading, hideLoading, showProgressLoading } = useLoading();

  const executeWithLoading = useCallback(async (
    operation: () => Promise<any>,
    message?: string
  ) => {
    try {
      showLoading(message);
      const result = await operation();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const executeWithProgress = useCallback(async (
    operation: (updateProgress: (progress: number) => void) => Promise<any>,
    message: string
  ) => {
    try {
      const updateProgress = (progress: number) => {
        showProgressLoading(message, progress);
      };
      const result = await operation(updateProgress);
      return result;
    } finally {
      hideLoading();
    }
  }, [showProgressLoading, hideLoading]);

  return {
    executeWithLoading,
    executeWithProgress,
  };
};