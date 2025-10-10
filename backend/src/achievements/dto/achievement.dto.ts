export interface AchievementCondition {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  favoritesCount?: number;
  restaurantsVisited?: number;
  likesReceived?: number;
  commentsCount?: number;
  consecutiveDays?: number;
}

export interface AchievementResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition: AchievementCondition;
  points: number;
  createdAt: Date;
}

export interface UserAchievementResponse {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  progress: number;
  achievement: AchievementResponse;
}

export interface UserStatsResponse {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  favoritesCount: number;
  restaurantsVisited?: number;
  likesReceived?: number;
  commentsCount?: number;
}

export interface AchievementProgressResponse {
  achievement: AchievementResponse;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  maxProgress: number;
  progressPercentage: number;
}

export class CheckAchievementsResponseDto {
  newAchievements: UserAchievementResponse[];
  totalPoints: number;
}
