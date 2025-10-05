import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealthStatus() {
    const startTime = Date.now();

    // Check database connection
    let databaseStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check cache connection
    let cacheStatus = 'disconnected';
    try {
      await this.cacheService.set('health-check', 'ok', 1);
      const result = await this.cacheService.get('health-check');
      cacheStatus = result === 'ok' ? 'connected' : 'error';
    } catch (error) {
      console.error('Cache health check failed:', error);
    }

    const responseTime = Date.now() - startTime;

    return {
      status:
        databaseStatus === 'connected' && cacheStatus === 'connected'
          ? 'ok'
          : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: databaseStatus,
      cache: cacheStatus,
      responseTime: `${responseTime}ms`,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };
  }
}
