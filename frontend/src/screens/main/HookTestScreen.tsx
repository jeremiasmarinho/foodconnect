import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export const HookTestScreen: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Hooks funcionando!");

  console.log("HookTestScreen renderizando - count:", count);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Teste de Hooks</Text>

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

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={() => {
            setCount(0);
            setMessage("Reset! Hooks funcionando!");
          }}
        >
          <Text style={styles.buttonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
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
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#FF5722",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
