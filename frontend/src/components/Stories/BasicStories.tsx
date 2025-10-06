import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BasicStoriesProps {
  currentUserId: string;
  onStoryView?: (storyId: string) => void;
  onStoryCreate?: (storyData: any) => void;
  onRefresh?: () => void;
}

export const BasicStories: React.FC<BasicStoriesProps> = ({
  currentUserId,
  onStoryView,
  onStoryCreate,
  onRefresh,
}) => {
  console.log("BasicStories renderizando para userId:", currentUserId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Stories (Basic)</Text>
      <View style={styles.storyContainer}>
        <View style={styles.storyRing}>
          <Text style={styles.storyText}>+</Text>
        </View>
        <Text style={styles.username}>Você</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginHorizontal: 15,
    color: "#333",
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e1e8ed",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ff6b6b",
  },
  storyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  username: {
    fontSize: 12,
    color: "#1a1a1a",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
});
