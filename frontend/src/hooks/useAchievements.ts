import { useState, useEffect, useCallback } from "react";
import achievementService, {
  Achievement,
  UserAchievement,
  UserStats,
  AchievementProgress,
  CheckAchievementsResponse,
} from "../services/achievement";

interface UseAchievementsReturn {
  // Data
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  userStats: UserStats | null;
  progress: AchievementProgress[];
  earnedCount: number;
  totalPoints: number;

  // Loading states
  loading: boolean;
  checking: boolean;

  // Error state
  error: string | null;

  // Actions
  loadAchievements: () => Promise<void>;
  loadUserAchievements: () => Promise<void>;
  loadUserStats: () => Promise<void>;
  loadProgress: () => Promise<void>;
  checkForNewAchievements: () => Promise<CheckAchievementsResponse | null>;
  getNextAchievements: (limit?: number) => Promise<AchievementProgress[]>;

  // Computed
  progressPercentage: number;
  nextAchievements: AchievementProgress[];
}

export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [nextAchievements, setNextAchievements] = useState<
    AchievementProgress[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all available achievements
   */
  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getAllAchievements();
      setAchievements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load achievements"
      );
      console.error("Error loading achievements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load user's earned achievements
   */
  const loadUserAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getUserAchievements();
      setUserAchievements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user achievements"
      );
      console.error("Error loading user achievements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load user statistics
   */
  const loadUserStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getUserStats();
      setUserStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user stats"
      );
      console.error("Error loading user stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load achievement progress
   */
  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getAchievementProgress();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load progress");
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check for newly unlocked achievements
   */
  const checkForNewAchievements =
    useCallback(async (): Promise<CheckAchievementsResponse | null> => {
      try {
        setChecking(true);
        setError(null);
        const result = await achievementService.checkAchievements();

        // If new achievements were unlocked, reload user achievements and progress
        if (result.newAchievements.length > 0) {
          await loadUserAchievements();
          await loadProgress();
        }

        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to check achievements"
        );
        console.error("Error checking achievements:", err);
        return null;
      } finally {
        setChecking(false);
      }
    }, [loadUserAchievements, loadProgress]);

  /**
   * Get next achievable achievements
   */
  const getNextAchievements = useCallback(
    async (limit: number = 3): Promise<AchievementProgress[]> => {
      try {
        const data = await achievementService.getNextAchievements(limit);
        setNextAchievements(data);
        return data;
      } catch (err) {
        console.error("Error getting next achievements:", err);
        return [];
      }
    },
    []
  );

  /**
   * Calculate overall progress percentage
   */
  const progressPercentage =
    achievements.length > 0
      ? Math.round((userAchievements.length / achievements.length) * 100)
      : 0;

  /**
   * Calculate total points earned
   */
  const totalPoints = userAchievements.reduce(
    (sum, ua) => sum + ua.achievement.points,
    0
  );

  /**
   * Count of earned achievements
   */
  const earnedCount = userAchievements.length;

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    loadAchievements();
    loadUserAchievements();
    loadUserStats();
    loadProgress();
    getNextAchievements();
  }, [
    loadAchievements,
    loadUserAchievements,
    loadUserStats,
    loadProgress,
    getNextAchievements,
  ]);

  return {
    // Data
    achievements,
    userAchievements,
    userStats,
    progress,
    earnedCount,
    totalPoints,

    // Loading states
    loading,
    checking,

    // Error state
    error,

    // Actions
    loadAchievements,
    loadUserAchievements,
    loadUserStats,
    loadProgress,
    checkForNewAchievements,
    getNextAchievements,

    // Computed
    progressPercentage,
    nextAchievements,
  };
};

export default useAchievements;
