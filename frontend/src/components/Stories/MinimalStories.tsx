import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Tipos mais simples para teste
interface Story {
  id: string;
  title: string;
}

interface MinimalStoriesProps {
  testData?: Story[];
}

export const MinimalStories: React.FC<MinimalStoriesProps> = ({
  testData = [
    { id: "1", title: "Story 1" },
    { id: "2", title: "Story 2" },
  ],
}) => {
  // Teste com hook mais básico possível
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testData.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MinimalStories Component</Text>
      <Text style={styles.subtitle}>Current Index: {currentIndex}</Text>
      <Text style={styles.story}>
        Story: {testData[currentIndex]?.title || "No story"}
      </Text>
      <View style={styles.button}>
        <Text onPress={handleNext} style={styles.buttonText}>
          Next Story
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  story: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
