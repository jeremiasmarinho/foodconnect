import { apiClient } from "../api/client";
import { ApiResponse, Post, CreatePostRequest, PostData } from "../types";

// Transformar Post do backend para PostData do frontend
function transformPost(post: Post): PostData {
  let images: string[] = [];

  // Tentar parsear imageUrls (JSON string)
  try {
    if (post.imageUrls) {
      images = JSON.parse(post.imageUrls);
    }
  } catch (e) {
    console.error("Error parsing imageUrls:", e);
  }

  // Fallback para imageUrl se imageUrls estiver vazio
  if (images.length === 0 && post.imageUrl) {
    images = [post.imageUrl];
  }

  return {
    id: post.id,
    content: post.content,
    images: images,
    postType: post.postType || "FOOD",
    rating: post.rating,
    userId: post.userId,
    user: post.user,
    establishmentId: post.establishmentId || post.restaurantId,
    establishment: post.establishment as any, // Type compatibility
    restaurant: post.restaurant as any, // Type compatibility
    location: post.establishment?.city || post.restaurant?.city,
    likesCount: post.likesCount || post._count?.likes || 0,
    commentsCount: post.commentsCount || post._count?.comments || 0,
    isLiked: post.isLiked || post.isLikedByUser || false,
    isSaved: false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export class PostService {
  // Buscar feed (usa filtrado como padrão)
  static async getFeed(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<ApiResponse<PostData[]>> {
    // Sempre usar feed filtrado que funciona sem userId
    return this.getFilteredFeed(undefined, page, limit);
  }

  // Buscar feed por filtro (timeline geral)
  static async getFilteredFeed(
    type?: "FOOD" | "DRINKS" | "SOCIAL",
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PostData[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        params.append("type", type);
      }

      const response = await apiClient.get<{
        success: boolean;
        data: Post[];
        meta?: any;
      }>(`/posts/feed/filtered?${params}`);

      // O backend retorna { success, data, meta }
      // Então response.data.data contém os posts
      // Transformar cada post para PostData
      const transformedPosts = (response.data.data || []).map(transformPost);

      return {
        success: true,
        data: transformedPosts,
      };
    } catch (error: any) {
      console.error("Error fetching filtered feed:", error);
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
