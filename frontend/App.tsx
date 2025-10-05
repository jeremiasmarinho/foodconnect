import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  AuthProvider,
  CartProvider,
  QueryProvider,
  ThemeProvider,
} from "./src/providers";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
