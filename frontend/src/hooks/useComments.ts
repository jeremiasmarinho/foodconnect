import { useState, useEffect, useCallback } from "react";
import { Comment } from "../services/comment";
import { CommentService } from "../services/comment";
import { useAuth } from "../providers";

interface UseCommentsConfig {
  postId: string;
  initialLoad?: boolean;
  pageSize?: number;
}

export function useComments(config: UseCommentsConfig) {
  const { postId, initialLoad = true, pageSize = 20 } = config;
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  // Carregar comentários
  const loadComments = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const response = await CommentService.getPostComments(
          postId,
          page,
          pageSize
        );

        if (response.success && response.data) {
          if (append) {
            setComments((prev) => [...prev, ...response.data!]);
          } else {
            setComments(response.data);
          }

          // Verificar se há mais comentários
          setHasMore(response.data.length === pageSize);
          setCurrentPage(page);
        } else {
          setError(response.error || "Erro ao carregar comentários");
        }
      } catch (err) {
        setError("Erro inesperado ao carregar comentários");
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [postId, loading, pageSize]
  );

  // Carregar mais comentários (paginação)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadComments(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, loadComments]);

  // Refresh comentários
  const refresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadComments(1, false);
  }, [loadComments]);

  // Adicionar comentário
  const addComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return false;

      setAddingComment(true);
      try {
        const response = await CommentService.addComment(
          postId,
          content.trim()
        );

        if (response.success && response.data) {
          // Adicionar o comentário no início da lista
          setComments((prev) => [response.data!, ...prev]);
          return true;
        } else {
          setError(response.error || "Erro ao adicionar comentário");
          return false;
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        setError("Erro inesperado ao adicionar comentário");
        return false;
      } finally {
        setAddingComment(false);
      }
    },
    [postId]
  );

  // Deletar comentário
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await CommentService.deleteComment(postId, commentId);

        if (response.success) {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
          return true;
        } else {
          setError(response.error || "Erro ao deletar comentário");
          return false;
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        setError("Erro inesperado ao deletar comentário");
        return false;
      }
    },
    [postId]
  );

  // Editar comentário
  const editComment = useCallback(
    async (commentId: string, newContent: string) => {
      if (!newContent.trim()) return false;

      try {
        const response = await CommentService.updateComment(
          commentId,
          newContent.trim()
        );

        if (response.success && response.data) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? response.data! : comment
            )
          );
          return true;
        } else {
          setError(response.error || "Erro ao editar comentário");
          return false;
        }
      } catch (error) {
        console.error("Error editing comment:", error);
        setError("Erro inesperado ao editar comentário");
        return false;
      }
    },
    []
  );

  // Curtir comentário
  const toggleCommentLike = useCallback(async (commentId: string) => {
    try {
      const response = await CommentService.toggleCommentLike(commentId);

      if (response.success && response.data) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: response.data!.liked,
                  likesCount: response.data!.likesCount,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  }, []);

  // Reportar comentário
  const reportComment = useCallback(
    async (commentId: string, reason: string) => {
      try {
        const response = await CommentService.reportComment(commentId, reason);
        return response.success;
      } catch (error) {
        console.error("Error reporting comment:", error);
        return false;
      }
    },
    []
  );

  // Verificar se usuário pode editar/deletar comentário
  const canModifyComment = useCallback(
    (comment: Comment) => {
      return user?.id === comment.userId;
    },
    [user]
  );

  // Carregar comentários iniciais
  useEffect(() => {
    if (initialLoad && postId) {
      loadComments(1, false);
    }
  }, [initialLoad, postId, loadComments]);

  return {
    // Data
    comments,
    commentsCount: comments.length,

    // States
    loading,
    refreshing,
    hasMore,
    error,
    addingComment,

    // Actions
    loadMore,
    refresh,
    addComment,
    deleteComment,
    editComment,
    toggleCommentLike,
    reportComment,

    // Utils
    canModifyComment,
    reload: () => loadComments(1, false),
  };
}
