import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from './token.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private tokenService: TokenService) {}

  /**
   * Clean up expired tokens every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    this.logger.log('Starting token cleanup job');

    try {
      await this.tokenService.cleanupExpiredTokens();
      this.logger.log('Token cleanup job completed successfully');
    } catch (error) {
      this.logger.error('Token cleanup job failed', error);
    }
  }

  /**
   * Manual cleanup trigger for testing
   */
  async cleanupNow() {
    this.logger.log('Manual token cleanup triggered');
    await this.tokenService.cleanupExpiredTokens();
  }
}
