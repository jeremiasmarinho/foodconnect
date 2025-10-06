import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Teste super básico sem nenhum provider ou hook
export default function BasicApp() {
  console.log("BasicApp renderizando!");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Teste Básico</Text>
      <Text style={styles.subtitle}>App sem hooks</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>Funcionando!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#666",
  },
  box: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  boxText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
