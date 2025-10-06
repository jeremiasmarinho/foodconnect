import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate and store refresh token
   */
  async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Create refresh token
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    this.logger.log('Refresh token generated', { userId });
    return token;
  }

  /**
   * Validate and refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  } | null> {
    // Find refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      this.logger.warn('Invalid or expired refresh token', {
        token: refreshToken.slice(0, 10),
      });
      return null;
    }

    // Generate new access token
    const payload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      username: tokenRecord.user.username,
    };

    const access_token = this.jwtService.sign(payload);

    // Generate new refresh token
    const newRefreshToken = await this.generateRefreshToken(
      tokenRecord.user.id,
      tokenRecord.userAgent || undefined,
      tokenRecord.ipAddress || undefined,
    );

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    this.logger.log('Access token refreshed', { userId: tokenRecord.user.id });

    return {
      access_token,
      refresh_token: newRefreshToken,
    };
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    // Invalidate any existing reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });

    // Create new reset token
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    this.logger.log('Password reset token generated', { userId });
    return token;
  }

  /**
   * Validate password reset token
   */
  async validatePasswordResetToken(token: string): Promise<string | null> {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (
      !tokenRecord ||
      tokenRecord.isUsed ||
      tokenRecord.expiresAt < new Date()
    ) {
      this.logger.warn('Invalid or expired password reset token');
      return null;
    }

    return tokenRecord.userId;
  }

  /**
   * Use password reset token
   */
  async usePasswordResetToken(token: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { isUsed: true },
    });
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // Invalidate any existing verification tokens
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });

    // Create new verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    this.logger.log('Email verification token generated', { userId });
    return token;
  }

  /**
   * Validate email verification token
   */
  async validateEmailVerificationToken(token: string): Promise<string | null> {
    const tokenRecord = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (
      !tokenRecord ||
      tokenRecord.isUsed ||
      tokenRecord.expiresAt < new Date()
    ) {
      this.logger.warn('Invalid or expired email verification token');
      return null;
    }

    return tokenRecord.userId;
  }

  /**
   * Use email verification token
   */
  async useEmailVerificationToken(token: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({
      where: { token },
      data: { isUsed: true },
    });
  }

  /**
   * Revoke all refresh tokens for user
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    this.logger.log('All refresh tokens revoked', { userId });
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    const results = await Promise.all([
      this.prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
    ]);

    this.logger.log('Expired tokens cleaned up', {
      refreshTokens: results[0].count,
      passwordResetTokens: results[1].count,
      emailVerificationTokens: results[2].count,
    });
  }
}
