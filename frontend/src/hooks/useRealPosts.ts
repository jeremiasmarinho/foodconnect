import { useState, useEffect, useCallback } from "react";
import { Post, PostType } from "../types";
import { PostService } from "../services/post";
import { useAuth } from "../contexts/AuthContext";

interface UseRealPostsConfig {
  initialLoad?: boolean;
  pageSize?: number;
}

export function useRealPosts(config: UseRealPostsConfig = {}) {
  const { initialLoad = true, pageSize = 10 } = config;
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState<PostType | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  // Carregar posts
  const loadPosts = useCallback(
    async (
      page: number = 1,
      filter: PostType | "ALL" = "ALL",
      append: boolean = false
    ) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const response =
          filter === "ALL"
            ? await PostService.getFeed(page, pageSize)
            : await PostService.getFilteredFeed(filter, page, pageSize);

        if (response.success && response.data) {
          if (append) {
            setPosts((prev) => [...prev, ...response.data!]);
          } else {
            setPosts(response.data);
          }

          // Verificar se há mais posts
          setHasMore(response.data.length === pageSize);
          setCurrentPage(page);
          setCurrentFilter(filter);
        } else {
          setError(response.error || "Erro ao carregar posts");
        }
      } catch (err) {
        setError("Erro inesperado ao carregar posts");
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, pageSize]
  );

  // Carregar mais posts (paginação)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadPosts(currentPage + 1, currentFilter, true);
    }
  }, [hasMore, loading, currentPage, currentFilter, loadPosts]);

  // Refresh posts
  const refresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadPosts(1, currentFilter, false);
  }, [currentFilter, loadPosts]);

  // Aplicar filtro
  const applyFilter = useCallback(
    (filter: PostType | "ALL") => {
      setCurrentPage(1);
      loadPosts(1, filter, false);
    },
    [loadPosts]
  );

  // Curtir post
  const toggleLike = useCallback(async (postId: string) => {
    try {
      const response = await PostService.toggleLike(postId);
      if (response.success && response.data) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: response.data!.liked,
                  likesCount: response.data!.likesCount,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }, []);

  // Adicionar comentário
  const addComment = useCallback(async (postId: string, content: string) => {
    try {
      const response = await PostService.addComment(postId, content);
      if (response.success) {
        // Atualizar contador de comentários
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
              : post
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  }, []);

  // Carregar posts iniciais
  useEffect(() => {
    if (initialLoad && isAuthenticated) {
      loadPosts(1, "ALL", false);
    }
  }, [initialLoad, isAuthenticated, loadPosts]);

  return {
    // Data
    posts,
    currentFilter,

    // States
    loading,
    refreshing,
    hasMore,
    error,

    // Actions
    loadMore,
    refresh,
    applyFilter,
    toggleLike,
    addComment,
    reload: () => loadPosts(1, currentFilter, false),
  };
}
