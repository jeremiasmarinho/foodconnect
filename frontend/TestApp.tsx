import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍕 FoodConnect</Text>
      <Text style={styles.subtitle}>Sistema de Pedidos Funcionando!</Text>
      <Text style={styles.status}>✅ Backend: OK</Text>
      <Text style={styles.status}>✅ Frontend: OK</Text>
      <Text style={styles.status}>✅ Banco: OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#EA1D2C",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  status: {
    fontSize: 16,
    color: "#00BF63",
    marginBottom: 10,
  },
});
