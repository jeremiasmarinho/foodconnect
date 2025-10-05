import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheService } from '../cache/cache.service';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, CacheService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
