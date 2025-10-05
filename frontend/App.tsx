import React from "react";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import { QueryProvider, AuthProvider, ThemeProvider } from "./src/providers";
import { CartProvider } from "./src/providers/CartProvider";
import { RootNavigator } from "./src/navigation";

// Hide status bar immediately
setStatusBarHidden(true, "none");

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
            <StatusBar style="light" hidden={true} />
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
