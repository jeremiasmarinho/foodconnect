import { apiClient } from "../api/client";
import { ApiResponse, Post, CreatePostRequest } from "../types";

export class PostService {
  // Buscar feed personalizado do usuário
  static async getFeed(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Post[]>> {
    try {
      const response = await apiClient.get<Post[]>(
        `/posts/feed/personalized?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao carregar feed",
      };
    }
  }

  // Buscar feed por filtro (timeline geral)
  static async getFilteredFeed(
    type?: "FOOD" | "DRINKS" | "SOCIAL",
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Post[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        params.append("type", type);
      }

      const response = await apiClient.get<Post[]>(
        `/posts/feed/filtered?${params}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao carregar posts",
      };
    }
  }

  // Buscar post específico
  static async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.get<Post>(`/posts/${postId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao carregar post",
      };
    }
  }

  // Criar novo post
  static async createPost(
    postData: CreatePostRequest
  ): Promise<ApiResponse<Post>> {
    try {
      // Converter array de imagens para JSON string para o backend
      const backendData = {
        ...postData,
        imageUrls: postData.images ? JSON.stringify(postData.images) : "[]",
        establishmentId:
          postData.establishmentId || "cmghu42ln0004hwri6tlbb23y", // ID do restaurante de exemplo
      };

      // Remover o campo images que é só para o frontend
      delete (backendData as any).images;

      const response = await apiClient.post<Post>("/posts", backendData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao criar post",
      };
    }
  }

  // Curtir/descurtir post
  static async toggleLike(
    postId: string
  ): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    try {
      const response = await apiClient.post<{
        liked: boolean;
        likesCount: number;
      }>(`/posts/${postId}/like`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao curtir post",
      };
    }
  }

  // Comentar em post
  static async addComment(
    postId: string,
    content: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/posts/${postId}/comment`, {
        content,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao comentar",
      };
    }
  }

  // Buscar posts do usuário
  static async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Post[]>> {
    try {
      const response = await apiClient.get<Post[]>(
        `/posts/user/${userId}?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Erro ao carregar posts do usuário",
      };
    }
  }

  // Buscar posts de um restaurante
  static async getRestaurantPosts(
    restaurantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Post[]>> {
    try {
      const response = await apiClient.get<Post[]>(
        `/posts/restaurant/${restaurantId}?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erro ao carregar posts do restaurante",
      };
    }
  }
}
