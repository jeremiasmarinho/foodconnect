import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Teste com hooks básicos
export default function HooksApp() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("App com hooks funcionando!");

  console.log("HooksApp renderizando - count:", count);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Teste com Hooks</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.counter}>
        <Text style={styles.counterText}>Count: {count}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setCount(count + 1);
          setMessage(`Botão clicado ${count + 1} vezes!`);
        }}
      >
        <Text style={styles.buttonText}>+ Incrementar</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  counter: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  counterText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
