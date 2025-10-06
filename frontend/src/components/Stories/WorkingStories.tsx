import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

interface WorkingStoriesProps {
  currentUserId: string;
  onStoryView?: (storyId: string) => void;
  onStoryCreate?: (storyData: any) => void;
  onRefresh?: () => void;
}

export const WorkingStories: React.FC<WorkingStoriesProps> = ({
  currentUserId,
  onStoryView,
  onStoryCreate,
  onRefresh,
}) => {
  const [count, setCount] = useState<number>(0);
  const [message, setMessage] = useState<string>("Stories System Working!");

  console.log(
    "WorkingStories renderizando para userId:",
    currentUserId,
    "count:",
    count
  );

  const handleCreateStory = (): void => {
    setCount((prev) => prev + 1);
    setMessage(`Story criado ${count + 1} vezes!`);
    console.log("Create story pressed, count:", count + 1);
    onStoryCreate?.({ count: count + 1, userId: currentUserId });
  };

  const handleViewStory = (storyId: string): void => {
    console.log("View story pressed for ID:", storyId);
    onStoryView?.(storyId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📖 Stories System</Text>
        <Text style={styles.subtitle}>TypeScript + React Native</Text>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.counter}>
          <Text style={styles.counterText}>Stories Created: {count}</Text>
        </View>

        <View style={styles.storiesContainer}>
          <TouchableOpacity
            style={[styles.storyRing, styles.createStory]}
            onPress={handleCreateStory}
          >
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
          <Text style={styles.storyLabel}>Você</Text>

          <TouchableOpacity
            style={[styles.storyRing, styles.viewStory]}
            onPress={() => handleViewStory("story-1")}
          >
            <Text style={styles.avatarText}>M</Text>
          </TouchableOpacity>
          <Text style={styles.storyLabel}>Maria</Text>

          <TouchableOpacity
            style={[styles.storyRing, styles.viewStory]}
            onPress={() => handleViewStory("story-2")}
          >
            <Text style={styles.avatarText}>J</Text>
          </TouchableOpacity>
          <Text style={styles.storyLabel}>João</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#555",
  },
  counter: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  counterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  storiesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 5,
  },
  createStory: {
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  viewStory: {
    backgroundColor: "#e1e8ed",
    borderWidth: 3,
    borderColor: "#ff6b6b",
  },
  plusIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  storyLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 10,
    minWidth: 50,
  },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
