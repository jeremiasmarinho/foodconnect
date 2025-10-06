export { StoryViewer } from "./StoryViewer";
export { StoryRing } from "./StoryRing";
export { StoriesList } from "./StoriesList";
export { StoryCreator } from "./StoryCreator";
export { StoriesContainer } from "./StoriesContainer";
export { SimpleStoriesContainer } from "./SimpleStoriesContainer";
export { SimpleStories } from "./SimpleStories";
export { BasicStories } from "./BasicStories";
export { TestStories } from "./TestStories";
export { WorkingStories } from "./WorkingStories";
export { MinimalStories } from "./MinimalStories";

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
