import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";

export const SimpleFeedScreen: React.FC = () => {
  console.log("SimpleFeedScreen renderizando!");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FoodConnect</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <Text style={styles.storiesTitle}>📖 Stories Funcionando!</Text>
          <View style={styles.storyRing}>
            <Text style={styles.storyText}>+</Text>
          </View>
          <Text style={styles.username}>Você</Text>
        </View>

        {/* Create Post Button */}
        <View style={styles.createPostSection}>
          <Text style={styles.createPostText}>➕ Criar Post</Text>
        </View>

        {/* Mock Posts */}
        <View style={styles.postsSection}>
          <View style={styles.mockPost}>
            <Text style={styles.postText}>Post de exemplo 1</Text>
          </View>
          <View style={styles.mockPost}>
            <Text style={styles.postText}>Post de exemplo 2</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    backgroundColor: "#ffffff",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  content: {
    flex: 1,
  },
  storiesSection: {
    paddingVertical: 20,
    backgroundColor: "#f0f8ff",
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
    alignItems: "center",
  },
  storiesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2E7D32",
  },
  storyRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e1e8ed",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ff6b6b",
    marginBottom: 8,
  },
  storyText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  username: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  createPostSection: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    alignItems: "center",
  },
  createPostText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  postsSection: {
    padding: 20,
  },
  mockPost: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  postText: {
    fontSize: 16,
    color: "#333",
  },
});
