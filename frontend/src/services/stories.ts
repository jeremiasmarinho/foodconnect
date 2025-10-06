import { API_CONFIG } from "../config/api";
import { AuthService } from "./auth";

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export interface Story {
  id: string;
  userId: string;
  content?: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  establishmentId?: string;
  location?: string;
  user: User;
  establishment?: {
    id: string;
    name: string;
    type: string;
    imageUrl?: string;
  };
  viewCount: number;
  hasViewed: boolean;
  recentViewers?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    viewedAt: string;
  }[];
}

export interface UserStories {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
  highlights: {
    id: string;
    userId: string;
    storyId: string;
    title: string;
    coverImage?: string;
    createdAt: string;
    order: number;
    story: {
      id: string;
      mediaUrl: string;
      mediaType: string;
      content?: string;
    };
  }[];
}

export interface CreateStoryData {
  content?: string;
  mediaUrl: string;
  mediaType?: string;
  establishmentId?: string;
  location?: string;
}

export interface CreateHighlightData {
  storyId: string;
  title: string;
  coverImage?: string;
  order?: number;
}

class StoriesService {
  private baseUrl = `${API_CONFIG.BASE_URL}/stories`;
  private authService = AuthService.getInstance();

  async getActiveStories(): Promise<UserStories[]> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(`${this.baseUrl}/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching active stories:", error);
      throw error;
    }
  }

  async getUserStories(userId: string): Promise<UserStories> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user stories:", error);
      throw error;
    }
  }

  async createStory(storyData: CreateStoryData): Promise<Story> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  }

  async viewStory(storyId: string): Promise<void> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(`${this.baseUrl}/${storyId}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking story as viewed:", error);
      throw error;
    }
  }

  async deleteStory(storyId: string): Promise<void> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(`${this.baseUrl}/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      throw error;
    }
  }

  async createHighlight(highlightData: CreateHighlightData): Promise<any> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(`${this.baseUrl}/highlights`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(highlightData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating highlight:", error);
      throw error;
    }
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    try {
      const token = await this.authService.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/highlights/${highlightId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting highlight:", error);
      throw error;
    }
  }

  // Helper method to upload image to server
  async uploadImage(imageUri: string): Promise<string> {
    try {
      const token = await this.authService.getAuthToken();
      const formData = new FormData();

      // Create file object from URI
      const filename = imageUri.split("/").pop() || "story-image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_CONFIG.BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.url || result.mediaUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  // Utility methods
  isStoryExpired(story: Story): boolean {
    return new Date(story.expiresAt) < new Date();
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "agora";
    if (diffInHours === 1) return "1h";
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d";
    return `${diffInDays}d`;
  }

  getStoryDuration(story: Story): number {
    // Default 5 seconds per story, can be customized based on content
    if (story.mediaType === "video") {
      return 15000; // 15 seconds for videos
    }
    if (story.content && story.content.length > 100) {
      return 7000; // 7 seconds for stories with longer text
    }
    return 5000; // 5 seconds default
  }
}

export const storiesService = new StoriesService();
