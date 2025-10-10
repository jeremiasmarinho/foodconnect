import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AchievementCondition } from './dto/achievement.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Initialize achievements (seed database)
   * POST /achievements/init
   */
  @Post('init')
  async initializeAchievements() {
    await this.achievementService.initializeAchievements();
    return {
      message: 'Achievements initialized successfully',
      count: 6,
    };
  }

  /**
   * Get all available achievements
   * GET /achievements
   */
  @Get()
  async getAllAchievements() {
    const achievements = await this.achievementService.getAllAchievements();

    return achievements.map((achievement) => ({
      ...achievement,
      condition: JSON.parse(achievement.condition) as AchievementCondition,
    }));
  }

  /**
   * Get user's earned achievements
   * GET /achievements/user
   */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserAchievements(@Request() req: AuthenticatedRequest) {
    const achievements = await this.achievementService.getUserAchievements(
      req.user.id,
    );

    return achievements.map((ua) => ({
      ...ua,
      achievement: {
        ...ua.achievement,
        condition: JSON.parse(ua.achievement.condition) as AchievementCondition,
      },
    }));
  }

  /**
   * Get user's statistics
   * GET /achievements/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req: AuthenticatedRequest) {
    return this.achievementService.getUserStats(req.user.id);
  }

  /**
   * Check for new achievements
   * POST /achievements/check
   */
  @Post('check')
  @UseGuards(JwtAuthGuard)
  async checkAchievements(@Request() req: AuthenticatedRequest) {
    const newAchievements = await this.achievementService.checkUserAchievements(
      req.user.id,
    );

    const totalPoints = newAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0,
    ) as number;

    return {
      newAchievements: newAchievements.map((ua) => ({
        ...ua,
        achievement: {
          ...ua.achievement,
          condition: JSON.parse(
            ua.achievement.condition,
          ) as AchievementCondition,
        },
      })),
      totalPoints,
    };
  }

  /**
   * Get achievement progress for user
   * GET /achievements/progress
   */
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getAchievementProgress(@Request() req: AuthenticatedRequest) {
    const userStats = await this.achievementService.getUserStats(req.user.id);
    const allAchievements = await this.achievementService.getAllAchievements();
    const userAchievements = await this.achievementService.getUserAchievements(
      req.user.id,
    );

    const earnedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua]),
    );

    return allAchievements.map((achievement) => {
      const condition = JSON.parse(
        achievement.condition,
      ) as AchievementCondition;
      const userAchievement = earnedMap.get(achievement.id);
      const earned = !!userAchievement;

      let progress = 0;
      let maxProgress = 0;

      // Calculate progress based on condition type
      if (condition.postsCount) {
        progress = userStats.postsCount;
        maxProgress = condition.postsCount;
      } else if (condition.followersCount) {
        progress = userStats.followersCount;
        maxProgress = condition.followersCount;
      } else if (condition.followingCount) {
        progress = userStats.followingCount;
        maxProgress = condition.followingCount;
      } else if (condition.favoritesCount) {
        progress = userStats.favoritesCount;
        maxProgress = condition.favoritesCount;
      }

      const progressPercentage =
        maxProgress > 0
          ? Math.min(100, Math.round((progress / maxProgress) * 100))
          : 0;

      return {
        achievement: {
          ...achievement,
          condition,
        },
        earned,
        earnedAt: userAchievement?.earnedAt || undefined,
        progress: Math.min(progress, maxProgress),
        maxProgress,
        progressPercentage,
      };
    });
  }
}
