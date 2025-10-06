import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  async initializeAchievements() {
    const achievements = [
      {
        name: 'Primeiro Post',
        description: 'Faça seu primeiro post sobre um prato delicioso',
        icon: '🎉',
        category: 'creator',
        condition: JSON.stringify({ postsCount: 1 }),
        points: 10,
      },
      {
        name: 'Explorador Gastronômico',
        description: 'Visite 5 restaurantes diferentes',
        icon: '🗺️',
        category: 'explorer',
        condition: JSON.stringify({ restaurantsVisited: 5 }),
        points: 25,
      },
      {
        name: 'Social Butterfly',
        description: 'Siga 10 outros usuários',
        icon: '🦋',
        category: 'social',
        condition: JSON.stringify({ followingCount: 10 }),
        points: 20,
      },
      {
        name: 'Influenciador',
        description: 'Tenha 50 seguidores',
        icon: '⭐',
        category: 'social',
        condition: JSON.stringify({ followersCount: 50 }),
        points: 50,
      },
      {
        name: 'Crítico Gastronômico',
        description: 'Escreva 20 posts com reviews detalhadas',
        icon: '📝',
        category: 'creator',
        condition: JSON.stringify({ postsCount: 20 }),
        points: 40,
      },
      {
        name: 'Favorito do Chef',
        description: 'Favorite 10 restaurantes',
        icon: '❤️',
        category: 'foodie',
        condition: JSON.stringify({ favoritesCount: 10 }),
        points: 15,
      },
    ];

    for (const achievement of achievements) {
      await this.prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
    }
  }

  async checkUserAchievements(userId: string) {
    // Buscar estatísticas do usuário
    const userStats = await this.getUserStats(userId);
    
    // Buscar conquistas disponíveis
    const achievements = await this.prisma.achievement.findMany();
    
    // Buscar conquistas já obtidas pelo usuário
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);

    // Verificar quais conquistas o usuário pode ganhar
    const newAchievements: any[] = [];
    
    for (const achievement of achievements) {
      if (earnedAchievementIds.includes(achievement.id)) continue;
      
      const condition = JSON.parse(achievement.condition);
      let isEarned = false;

      // Verificar condições
      if (condition.postsCount && userStats.postsCount >= condition.postsCount) {
        isEarned = true;
      } else if (condition.followersCount && userStats.followersCount >= condition.followersCount) {
        isEarned = true;
      } else if (condition.followingCount && userStats.followingCount >= condition.followingCount) {
        isEarned = true;
      } else if (condition.favoritesCount && userStats.favoritesCount >= condition.favoritesCount) {
        isEarned = true;
      }

      if (isEarned) {
        const newAchievement = await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
          include: { achievement: true },
        });
        newAchievements.push(newAchievement);
      }
    }

    return newAchievements;
  }

  async getUserStats(userId: string) {
    const [postsCount, followersCount, followingCount, favoritesCount] = await Promise.all([
      this.prisma.post.count({ where: { userId: userId } }),
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.favoriteRestaurant.count({ where: { userId } }),
    ]);

    return {
      postsCount,
      followersCount,
      followingCount,
      favoritesCount,
    };
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { points: 'asc' }],
    });
  }
}