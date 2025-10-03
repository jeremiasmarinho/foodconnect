import React from "react";
import { StatusBar } from "expo-status-bar";
import { QueryProvider, AuthProvider, ThemeProvider } from "./src/providers";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
