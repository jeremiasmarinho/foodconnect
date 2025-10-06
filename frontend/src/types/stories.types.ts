/**
 * Tipos relacionados aos Stories
 * Segue padrões do FoodConnect: Tipos centralizados
 */

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewedBy: string[];
  isHighlighted: boolean;
}

export interface StoryView {
  id: string;
  storyId: string;
  userId: string;
  viewedAt: string;
}

export interface CreateStoryRequest {
  imageUrl: string;
  isHighlighted?: boolean;
}

export interface StoriesResponse {
  stories: Story[];
  hasMore: boolean;
}

export interface StoryMetrics {
  totalViews: number;
  uniqueViews: number;
  viewedByFollowers: number;
}
