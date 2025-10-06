export class StoryResponseDto {
  id: string;
  userId: string;
  content?: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  establishmentId?: string;
  location?: string;

  // User info
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };

  // Establishment info (if tagged)
  establishment?: {
    id: string;
    name: string;
    type: string;
    imageUrl?: string;
  };

  // View statistics
  viewCount: number;
  hasViewed: boolean; // If current user has viewed

  // Recent viewers (for story owner)
  recentViewers?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    viewedAt: Date;
  }[];
}

export class HighlightResponseDto {
  id: string;
  userId: string;
  storyId: string;
  title: string;
  coverImage?: string;
  createdAt: Date;
  order: number;

  // Story data
  story: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    content?: string;
  };
}

export class UserStoriesResponseDto {
  userId: string;
  username: string;
  name: string;
  avatar?: string;

  // Active stories (not expired)
  stories: StoryResponseDto[];

  // Has unviewed stories by current user
  hasUnviewed: boolean;

  // Highlighted stories
  highlights: HighlightResponseDto[];
}
