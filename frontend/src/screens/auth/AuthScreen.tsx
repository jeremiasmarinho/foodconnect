import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";

export function AuthScreen() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register">(
    "login"
  );

  const switchToRegister = () => setCurrentScreen("register");
  const switchToLogin = () => setCurrentScreen("login");

  return (
    <View style={styles.container}>
      {currentScreen === "login" ? (
        <LoginScreen onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterScreen onSwitchToLogin={switchToLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
