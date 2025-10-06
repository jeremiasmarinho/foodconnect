import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const TestStories: React.FC = () => {
  console.log("TestStories está renderizando!");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Stories Funcionando!</Text>
      <View style={styles.testBox}>
        <Text style={styles.testText}>Stories OK</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#f0f8ff",
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2E7D32",
  },
  testBox: {
    width: 100,
    height: 100,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  testText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
