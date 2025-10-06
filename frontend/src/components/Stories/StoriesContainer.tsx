import React from "react";
import { View, StyleSheet } from "react-native";
import { StoriesList } from "./StoriesList";
import { StoryViewer } from "./StoryViewer";
import { useStoriesController } from "../../hooks/useStoriesController";
import { Story } from "../../types/stories.types";

interface StoriesContainerProps {
  currentUserId: string;
}

/**
 * Container principal do sistema de Stories
 * Segue padrões do FoodConnect: Container/Presentational Components
 */
export const StoriesContainer: React.FC<StoriesContainerProps> = ({
  currentUserId,
}) => {
  const {
    stories,
    viewingStory,
    loading,
    error,
    viewStory,
    closeStoryViewer,
    markAsViewed,
    refreshStories,
  } = useStoriesController(currentUserId);

  if (loading) {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      {/* Lista horizontal de Stories */}
      <StoriesList
        currentUserId={currentUserId}
        onStoryView={(storyId: string) => {
          const story = stories.find((s: Story) => s.id === storyId);
          if (story) viewStory(story);
        }}
        onRefresh={refreshStories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  loading: {
    height: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
  },
});
