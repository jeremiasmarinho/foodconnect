import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useAuth } from "../../providers";
import { PostCard, SearchBar, Loading, ErrorView } from "../../components/ui";
import { useFeedPosts } from "../../hooks";
import { Post, User } from "../../types";
import { mockPosts, mockUsers } from "../../data/mockData";

export const FeedScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Using mock data for now - replace with real API call when backend is connected
  const allPosts = mockPosts;
  const isLoading = false;
  const isError = false;

  // Memoize filtered posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPosts;
    }

    return allPosts.filter(
      (post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPosts, searchQuery]);

  const handlePostPress = useCallback((post: Post) => {
    // TODO: Navigate to post detail
    console.log("Post pressed:", post.id);
  }, []);

  const handleUserPress = useCallback((user: User) => {
    // TODO: Navigate to user profile
    console.log("User pressed:", user.id);
  }, []);

  const handleRestaurantPress = useCallback((restaurantId: string) => {
    // TODO: Navigate to restaurant detail
    console.log("Restaurant pressed:", restaurantId);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement search
    console.log("Search:", query);
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const renderHeader = useCallback(
    () => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.typography.fontSize.xxxl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary,
            }}
          >
            FoodConnect
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Olá, {user?.name?.split(" ")[0] || "Foodie"}! 🍕 Descubra novos
            sabores
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            padding: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceVariant,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    ),
    [theme, user?.name, handleLogout]
  );

  const renderSearchBar = useCallback(
    () => (
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <SearchBar
          placeholder="Buscar posts, restaurantes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          showFilter={true}
          onFilterPress={() => {
            // TODO: Open filter modal
            console.log("Filter pressed");
          }}
        />
      </View>
    ),
    [theme.spacing.lg, handleSearch]
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <PostCard
          post={item}
          onPress={() => handlePostPress(item)}
          onUserPress={handleUserPress}
          onRestaurantPress={handleRestaurantPress}
        />
      </View>
    ),
    [theme.spacing.lg, handlePostPress, handleUserPress, handleRestaurantPress]
  );

  const renderFooter = useCallback(() => {
    // Mock loading footer - would show when loading more posts
    return null;
  }, []);

  const renderEmpty = useCallback(
    () => (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.spacing.xxxxl,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <Ionicons
          name="restaurant-outline"
          size={64}
          color={theme.colors.textTertiary}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Text
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.textPrimary,
            textAlign: "center",
            marginBottom: theme.spacing.sm,
          }}
        >
          Nenhum post ainda
        </Text>
        <Text
          style={{
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textSecondary,
            textAlign: "center",
            lineHeight:
              theme.typography.lineHeight.relaxed *
              theme.typography.fontSize.md,
          }}
        >
          Seja o primeiro a compartilhar uma experiência gastronômica incrível!
        </Text>
      </View>
    ),
    [theme]
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        {renderHeader()}
        <Loading text="Carregando feed..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        {renderHeader()}
        <ErrorView
          title="Ops! Algo deu errado"
          message="Não foi possível carregar o feed. Tente novamente."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderSearchBar()}
          </>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              // Mock refresh - would reload posts from API
              console.log("Refreshing feed...");
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          // Mock load more - would fetch next page of posts
          console.log("Loading more posts...");
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredPosts.length === 0
            ? { flex: 1 }
            : { paddingBottom: theme.spacing.xl }
        }
      />
    </SafeAreaView>
  );
};
