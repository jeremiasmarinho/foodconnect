import apiClient from "./api/client";

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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition: AchievementCondition;
  points: number;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  progress: number;
  achievement: Achievement;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  favoritesCount: number;
  restaurantsVisited?: number;
  likesReceived?: number;
  commentsCount?: number;
}

export interface AchievementProgress {
  achievement: Achievement;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  maxProgress: number;
  progressPercentage: number;
}

export interface CheckAchievementsResponse {
  newAchievements: UserAchievement[];
  totalPoints: number;
}

class AchievementService {
  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>("/achievements");
    return response.map((achievement) => ({
      ...achievement,
      createdAt: new Date(achievement.createdAt),
    }));
  }

  /**
   * Get user's earned achievements
   */
  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await apiClient.get<UserAchievement[]>(
      "/achievements/user"
    );
    return response.map((ua) => ({
      ...ua,
      earnedAt: new Date(ua.earnedAt),
      achievement: {
        ...ua.achievement,
        createdAt: new Date(ua.achievement.createdAt),
      },
    }));
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>("/achievements/stats");
    return response;
  }

  /**
   * Check for new achievements
   * Call this after actions that might unlock achievements
   */
  async checkAchievements(): Promise<CheckAchievementsResponse> {
    const response = await apiClient.post<CheckAchievementsResponse>(
      "/achievements/check"
    );
    return {
      newAchievements: response.newAchievements.map((ua) => ({
        ...ua,
        earnedAt: new Date(ua.earnedAt),
        achievement: {
          ...ua.achievement,
          createdAt: new Date(ua.achievement.createdAt),
        },
      })),
      totalPoints: response.totalPoints,
    };
  }

  /**
   * Get achievement progress for all achievements
   */
  async getAchievementProgress(): Promise<AchievementProgress[]> {
    const response = await apiClient.get<AchievementProgress[]>(
      "/achievements/progress"
    );
    return response.map((progress) => ({
      ...progress,
      achievement: {
        ...progress.achievement,
        createdAt: new Date(progress.achievement.createdAt),
      },
      earnedAt: progress.earnedAt ? new Date(progress.earnedAt) : undefined,
    }));
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(
    category: string
  ): Promise<AchievementProgress[]> {
    const allProgress = await this.getAchievementProgress();
    return allProgress.filter((p) => p.achievement.category === category);
  }

  /**
   * Get earned achievements count
   */
  async getEarnedCount(): Promise<number> {
    const userAchievements = await this.getUserAchievements();
    return userAchievements.length;
  }

  /**
   * Get total points earned
   */
  async getTotalPoints(): Promise<number> {
    const userAchievements = await this.getUserAchievements();
    return userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);
  }

  /**
   * Get next achievable achievements (closest to completion)
   */
  async getNextAchievements(limit: number = 3): Promise<AchievementProgress[]> {
    const allProgress = await this.getAchievementProgress();
    const unearned = allProgress.filter((p) => !p.earned && p.maxProgress > 0);

    // Sort by progress percentage descending
    unearned.sort((a, b) => b.progressPercentage - a.progressPercentage);

    return unearned.slice(0, limit);
  }
}

export default new AchievementService();
