import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
        max: configService.get('CACHE_MAX_ITEMS', 100),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheModule, CacheService],
})
export class CacheConfigModule {}
