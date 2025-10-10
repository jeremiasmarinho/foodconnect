import { apiClient } from "../api/client";

// Types
export interface StoryUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export interface StoryEstablishment {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
}

export interface StoryViewer {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  viewedAt: Date;
}

export interface Story {
  id: string;
  userId: string;
  content?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  establishmentId?: string;
  location?: string;
  user: StoryUser;
  establishment?: StoryEstablishment;
  viewCount: number;
  hasViewed: boolean;
  recentViewers?: StoryViewer[];
}

export interface Highlight {
  id: string;
  userId: string;
  storyId: string;
  title: string;
  coverImage?: string;
  createdAt: Date;
  order: number;
  story: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    content?: string;
  };
}

export interface UserStories {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
  highlights: Highlight[];
}

export interface CreateStoryRequest {
  content?: string;
  mediaUrl: string;
  mediaType?: "image" | "video";
  establishmentId?: string;
  location?: string;
}

export interface CreateHighlightRequest {
  storyId: string;
  title: string;
  coverImage?: string;
  order?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class StoryService {
  /**
   * Create a new story
   */
  static async createStory(
    data: CreateStoryRequest
  ): Promise<ApiResponse<Story>> {
    try {
      const response = await apiClient.post<Story>("/stories", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao criar story",
      };
    }
  }

  /**
   * Get active stories from followed users
   */
  static async getActiveStories(): Promise<ApiResponse<UserStories[]>> {
    try {
      const response = await apiClient.get<UserStories[]>("/stories/active");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao carregar stories",
      };
    }
  }

  /**
   * Get stories from a specific user
   */
  static async getUserStories(
    userId: string
  ): Promise<ApiResponse<UserStories>> {
    try {
      const response = await apiClient.get<UserStories>(
        `/stories/user/${userId}`
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
          "Erro ao carregar stories do usuário",
      };
    }
  }

  /**
   * Mark a story as viewed
   */
  static async viewStory(storyId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/stories/${storyId}/view`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao visualizar story",
      };
    }
  }

  /**
   * Delete a story
   */
  static async deleteStory(storyId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/stories/${storyId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar story",
      };
    }
  }

  /**
   * Create a highlight (saved story)
   */
  static async createHighlight(
    data: CreateHighlightRequest
  ): Promise<ApiResponse<Highlight>> {
    try {
      const response = await apiClient.post<Highlight>(
        "/stories/highlights",
        data
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao criar destaque",
      };
    }
  }

  /**
   * Delete a highlight
   */
  static async deleteHighlight(
    highlightId: string
  ): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/stories/highlights/${highlightId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao deletar destaque",
      };
    }
  }

  /**
   * Upload media for story
   * Returns the uploaded media URL
   */
  static async uploadStoryMedia(
    file: File | Blob,
    type: "image" | "video" = "image"
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await apiClient.post<{ url: string }>(
        "/upload/story",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer upload",
      };
    }
  }
}
