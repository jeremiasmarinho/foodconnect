import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementService } from './achievement.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AchievementsController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementsModule {}
