import React from "react";
import { StatusBar, ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthScreen } from "./src/screens/auth/AuthScreen";
import ErrorBoundary from "./src/components/ErrorBoundary/ErrorBoundary";
import { ErrorProvider } from "./src/contexts/ErrorContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2D5A27" />
      </View>
    );
  }

  return isAuthenticated ? <RootNavigator /> : <AuthScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <AppContent />
            <StatusBar barStyle="dark-content" />
          </AuthProvider>
        </SafeAreaProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
