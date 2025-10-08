export { SimpleStoriesContainer } from "./SimpleStoriesContainer";

// Types
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
  user: User;
  viewCount: number;
  hasViewed: boolean;
}

export interface UserStories {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
}
