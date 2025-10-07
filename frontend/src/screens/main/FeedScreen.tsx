import React, { useState } from "react";
import { SimpleStoriesContainer } from "../../components/Stories";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers";
import { Loading, EmptyState } from "../../components/ui";
import { Post } from "../../components/Post";
import { CreatePostButton } from "../../components/CreatePostButton";
import { usePost } from "../../hooks/usePost";
import { LIGHT_THEME } from "../../constants/theme";
import { PostType } from "../../types";

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    refreshPosts,
    toggleLike,
    toggleSave,
    openComments,
    sharePost,
    openUserProfile,
  } = usePost();

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState<PostType | "ALL">("ALL");

  const filters = [
    { key: "ALL" as const, label: "Todos", icon: "grid-outline" },
    { key: "FOOD" as const, label: "Comida", icon: "restaurant-outline" },
    { key: "DRINKS" as const, label: "Bebidas", icon: "wine-outline" },
    { key: "SOCIAL" as const, label: "Social", icon: "people-outline" },
  ];

  // Filter posts based on selected type
  const filteredPosts = posts.filter(
    (post) => selectedFilter === "ALL" || post.postType === selectedFilter
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>FoodConnect</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={LIGHT_THEME.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={LIGHT_THEME.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon as any}
              size={18}
              color={
                selectedFilter === filter.key
                  ? LIGHT_THEME.surface
                  : LIGHT_THEME.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleCreatePostPress = () => {
    console.log("Create post pressed");
  };

  const renderPost = ({ item }: { item: any }) => (
    <Post
      post={item}
      onLike={toggleLike}
      onComment={openComments}
      onSave={toggleSave}
      onShare={sharePost}
      onUserPress={openUserProfile}
      friends={[]} // TODO: Fetch user's friends
      onTagFriend={(postId, userId, x, y, imageIndex) => {
        console.log("Tag friend:", { postId, userId, x, y, imageIndex });
        // TODO: Implement API call to tag friend
      }}
      onRemoveTag={(tagId) => {
        console.log("Remove tag:", tagId);
        // TODO: Implement API call to remove tag
      }}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      title="Nenhum post ainda"
      description="Seja o primeiro a compartilhar algo!"
      icon="restaurant-outline"
    />
  );

  if (loading && posts.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={LIGHT_THEME.surface}
      />
      {renderHeader()}

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
            colors={[LIGHT_THEME.primary]}
            tintColor={LIGHT_THEME.primary}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Stories Section */}
            <SimpleStoriesContainer currentUserId={user?.id || "temp-user"} />

            {/* Filters */}
            {renderFilters()}

            {/* Create Post Button */}
            <CreatePostButton
              userAvatar={user?.avatar}
              onPress={handleCreatePostPress}
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          filteredPosts.length === 0 ? styles.emptyContainer : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: LIGHT_THEME.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LIGHT_THEME.surfaceVariant,
    marginRight: 8,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: LIGHT_THEME.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: LIGHT_THEME.textSecondary,
  },
  activeFilterText: {
    color: LIGHT_THEME.surface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: LIGHT_THEME.border,
  },
});
