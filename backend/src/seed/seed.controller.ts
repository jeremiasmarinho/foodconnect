import { Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  private readonly logger = new Logger(SeedController.name);

  constructor(private readonly seedService: SeedService) {}

  /**
   * Seed the database with test data
   * POST /seed/database
   */
  @Post('database')
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    this.logger.log('Starting database seeding via API...');

    const result = await this.seedService.seedDatabase();

    this.logger.log('Database seeding completed via API');

    return result;
  }
}
