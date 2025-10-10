import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, ThemeProvider, QueryProvider } from "./src/providers";
import { RootNavigator } from "./src/navigation/RootNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary/ErrorBoundary";
import { ErrorProvider } from "./src/contexts/ErrorContext";

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <SafeAreaProvider>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <RootNavigator />
                <StatusBar barStyle="dark-content" />
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
