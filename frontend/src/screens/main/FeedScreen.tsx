import React, { useState } from "react";
import { StoriesContainer } from "../../components/Stories";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useAuth, useTheme } from "../../providers";
import { Post } from "../../components/Post";
import { CreatePostButton } from "../../components/CreatePostButton";
import { AppHeader } from "../../components/AppHeader";
import { useRealPosts } from "../../hooks/useRealPosts";
import { PostType, PostData } from "../../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    posts,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    applyFilter,
    toggleLike,
    currentFilter,
  } = useRealPosts();

  const [selectedFilter, setSelectedFilter] = useState<PostType | "ALL">("ALL");

  // Aplicar filtro
  const handleFilterPress = (filter: PostType | "ALL") => {
    setSelectedFilter(filter);
    applyFilter(filter);
  };

  // Navegar para criação de post
  const handleCreatePost = () => {
    navigation.navigate("CreatePost");
  };

  // Renderizar filtros com design moderno
  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.filtersRow}>
        {[
          { key: "ALL", label: "Tudo", icon: "apps" },
          { key: "FOOD", label: "Comida", icon: "restaurant" },
          { key: "DRINKS", label: "Bebidas", icon: "beer" },
          { key: "SOCIAL", label: "Social", icon: "people" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedFilter === filter.key
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
              },
            ]}
            onPress={() => handleFilterPress(filter.key as PostType | "ALL")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={
                selectedFilter === filter.key
                  ? theme.colors.textOnPrimary
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    selectedFilter === filter.key
                      ? theme.colors.textOnPrimary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Renderizar post
  const renderPost = ({ item }: { item: PostData }) => (
    <Post
      post={item}
      onLike={() => toggleLike(item.id)}
      onComment={() => navigation.navigate("Comments", { postId: item.id })}
      onSave={() => console.log("Salvar post:", item.id)}
      onShare={() => console.log("Compartilhar post:", item.id)}
      onUserPress={(userId) => {
        if (userId === user?.id) {
          // Navegar para próprio perfil (tab Profile)
          navigation.navigate("Main");
        } else {
          // Navegar para perfil de outro usuário
          console.log("Ver perfil:", userId);
        }
      }}
    />
  );

  // Header do Feed com Stories e Filtros
  const renderListHeader = () => (
    <View>
      {/* Stories */}
      <StoriesContainer currentUserId={user?.id || ""} />
      
      {/* Filtros */}
      {renderFilters()}
      
      {/* Botão de criar post */}
      <View style={styles.createPostContainer}>
        <CreatePostButton onPress={handleCreatePost} />
      </View>
    </View>
  );

  // Loading inicial
  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader title="FoodConnect" showSearch showNotifications />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Carregando posts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader title="FoodConnect" showSearch showNotifications />
        <View style={styles.centerContainer}>
          <Ionicons name="warning-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Erro ao carregar posts
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={refresh}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}>
        Nenhum post encontrado
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
        {selectedFilter === "ALL"
          ? "Siga mais pessoas para ver posts no seu feed"
          : `Nenhum post de ${selectedFilter.toLowerCase()} encontrado`}
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Search")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#fff" />
        <Text style={styles.exploreButtonText}>Explorar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "default"}
        backgroundColor={theme.colors.surface}
      />
      
      <AppHeader
        title="FoodConnect"
        showSearch={true}
        showNotifications={true}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={
          hasMore && posts.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Carregando mais posts...
              </Text>
            </View>
          ) : posts.length > 0 ? (
            <View style={styles.footerEnd}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={[styles.footerEndText, { color: theme.colors.textSecondary }]}>
                Você está em dia! 🎉
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  createPostContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 32,
  },
  footerEndText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
