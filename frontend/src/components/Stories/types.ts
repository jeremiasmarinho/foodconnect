// Shared UI types for Stories components

export interface UIUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export interface UIStory {
  id: string;
  userId: string;
  content?: string;
  mediaUrl: string; // normalized from domain imageUrl
  mediaType: string; // e.g., "image" | "video"
  createdAt: string;
  expiresAt: string;
  user: UIUser;
  viewCount: number;
  hasViewed: boolean;
}

export interface UIUserStories {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  stories: UIStory[];
  hasUnviewed: boolean;
}
