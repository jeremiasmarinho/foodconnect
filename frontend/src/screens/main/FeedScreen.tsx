import React from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers";
import { Loading, EmptyState } from "../../components/ui";
import { Post } from "../../components/Post";
import { Stories } from "../../components/Stories";
import { CreatePostButton } from "../../components/CreatePostButton";
import { usePost } from "../../hooks/usePost";
import { LIGHT_THEME } from "../../constants/theme";

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

  const handleStoryPress = (story: any) => {
    console.log("Story pressed:", story);
    // TODO: Navigate to story viewer
  };

  const handleAddStoryPress = () => {
    console.log("Add story pressed");
    // TODO: Navigate to story creation
  };

  const handleCreatePostPress = () => {
    console.log("Create post pressed");
    // TODO: Navigate to create post screen
  };

  const renderPost = ({ item }: { item: any }) => (
    <Post
      post={item}
      onLike={toggleLike}
      onComment={openComments}
      onSave={toggleSave}
      onShare={sharePost}
      onUserPress={openUserProfile}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="restaurant-outline"
      title="Nenhum post encontrado"
      description="Siga mais pessoas para ver posts no seu feed"
    />
  );

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={LIGHT_THEME.surface}
      />
      {renderHeader()}

      <FlatList
        data={posts}
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
            <Stories
              onStoryPress={handleStoryPress}
              onAddStoryPress={handleAddStoryPress}
            />
            <CreatePostButton
              userAvatar={user?.avatar}
              onPress={handleCreatePostPress}
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContainer : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: LIGHT_THEME.primary,
    fontFamily: "System", // Use custom font if available
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: LIGHT_THEME.surfaceVariant,
  },
});
