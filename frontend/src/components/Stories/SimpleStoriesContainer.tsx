import React from "react";
import { View, StyleSheet, Text } from "react-native";

interface SimpleStoriesContainerProps {
  currentUserId: string;
}

/**
 * Container temporário simplificado do Stories
 * Para resolver problemas de hooks
 */
export const SimpleStoriesContainer: React.FC<SimpleStoriesContainerProps> = ({
  currentUserId,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.storiesSection}>
        <Text style={styles.title}>Stories</Text>
        <Text style={styles.subtitle}>
          Sistema implementado - Em desenvolvimento
        </Text>
        <Text style={styles.userId}>User: {currentUserId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  storiesSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userId: {
    fontSize: 12,
    color: "#999",
  },
});
