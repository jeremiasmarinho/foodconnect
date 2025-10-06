import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { StoryRing } from "./StoryRing";
import { UIUserStories } from "./types";

interface SimpleStoriesProps {
  currentUserId: string;
  onStoryView?: (storyId: string) => void;
  onStoryCreate?: (storyData: any) => void;
  onRefresh?: () => void;
}

export const SimpleStories: React.FC<SimpleStoriesProps> = ({
  currentUserId,
  onStoryView,
  onStoryCreate,
  onRefresh,
}) => {
  console.log("SimpleStories está renderizando!");

  // Mock data for testing
  const mockUserStories: UIUserStories = {
    userId: currentUserId,
    username: "current_user",
    name: "Você",
    avatar: undefined,
    stories: [],
    hasUnviewed: false,
  };

  const mockOtherStories: UIUserStories[] = [
    {
      userId: "2",
      username: "maria_silva",
      name: "Maria",
      avatar: undefined,
      stories: [
        {
          id: "1",
          userId: "2",
          content: "",
          mediaUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
          mediaType: "image",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user: { id: "2", username: "maria_silva", name: "Maria" },
          viewCount: 0,
          hasViewed: false,
        },
      ],
      hasUnviewed: true,
    },
    {
      userId: "3",
      username: "joao123",
      name: "João",
      avatar: undefined,
      stories: [
        {
          id: "2",
          userId: "3",
          content: "",
          mediaUrl:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          mediaType: "image",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user: { id: "3", username: "joao123", name: "João" },
          viewCount: 1,
          hasViewed: true,
        },
      ],
      hasUnviewed: false,
    },
  ];

  const handleCreateStory = () => {
    console.log("Create story pressed");
    onStoryCreate?.({ test: "data" });
  };

  const handleViewStory = (userStories: any) => {
    console.log("View story pressed for:", userStories.name);
    onStoryView?.(userStories.stories[0]?.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Stories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.storyWrapper}>
          <StoryRing
            userStories={mockUserStories}
            onPress={handleCreateStory}
            isCurrentUser={true}
          />
        </View>

        {mockOtherStories.map((userStories) => (
          <View key={userStories.userId} style={styles.storyWrapper}>
            <StoryRing
              userStories={userStories}
              onPress={() => handleViewStory(userStories)}
              isCurrentUser={false}
            />
          </View>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 12,
  },
  storyWrapper: {
    marginHorizontal: 4,
  },
  storyItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 80,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e1e8ed",
    marginBottom: 4,
  },
  username: {
    fontSize: 12,
    color: "#1a1a1a",
    textAlign: "center",
    fontWeight: "500",
  },
});
