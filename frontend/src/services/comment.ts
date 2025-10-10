import { apiClient } from "../api/client";
import { ApiResponse } from "../types";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  postId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  timeAgo?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export class CommentService {
  // Buscar comentários de um post
  static async getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Comment[];
      }>(`/posts/${postId}/comments`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao carregar comentários",
      };
    }
  }

  // Adicionar comentário a um post
  static async addComment(
    postId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Comment;
      }>(`/posts/${postId}/comments`, { content });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao adicionar comentário",
      };
    }
  }

  // Editar comentário
  static async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiClient.put<Comment>(`/comments/${commentId}`, {
        content,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao editar comentário",
      };
    }
  }

  // Deletar comentário
  static async deleteComment(
    postId: string,
    commentId: string
  ): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar comentário",
      };
    }
  }

  // Curtir/descurtir comentário
  static async toggleCommentLike(
    commentId: string
  ): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    try {
      const response = await apiClient.post<{
        liked: boolean;
        likesCount: number;
      }>(`/comments/${commentId}/like`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao curtir comentário",
      };
    }
  }

  // Responder a um comentário
  static async replyToComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiClient.post<Comment>(
        `/comments/${commentId}/reply`,
        { content }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao responder comentário",
      };
    }
  }

  // Reportar comentário
  static async reportComment(
    commentId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/comments/${commentId}/report`, { reason });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao reportar comentário",
      };
    }
  }
}
