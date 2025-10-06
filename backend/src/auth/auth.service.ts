import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { TokenService } from './token.service';
import { EmailService } from './email.service';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    emailVerified: boolean;
  };
}

/**
 * DECISION LOG: Authentication Implementation
 *
 * Analysis Date: 2025-10-02
 * Options Evaluated:
 * 1. Custom JWT implementation - 3 days dev time
 * 2. @nestjs/jwt + passport - 6 hours integration
 * 3. Auth0 integration - 4 hours + $25/month
 *
 * Decision: Option 2 (@nestjs/jwt + passport)
 * Reasoning:
 * - Fast implementation (6h vs 3 days)
 * - Battle-tested security
 * - Zero monthly cost
 * - Full control over auth flow
 *
 * Alternative for future: Migrate to Auth0 when user base > 1000
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  /**
   * Register new user with email validation and password hashing
   * @param registerDto - User registration data
   * @returns JWT token and user data
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log('Starting user registration', {
      email: registerDto.email,
      name: registerDto.name,
    });

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    try {
      // Create user
      // Generate username from email
      const baseUsername = registerDto.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Ensure username is unique
      while (await this.prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username,
          name: registerDto.name,
          password: hashedPassword,
          emailVerified: false,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      this.logger.log('User registered successfully', { userId: user.id });

      // Generate JWT
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
      };

      const access_token = this.jwtService.sign(payload);
      const refresh_token = await this.tokenService.generateRefreshToken(
        user.id,
      );

      // Generate email verification token and send email
      const emailToken = await this.tokenService.generateEmailVerificationToken(
        user.id,
      );
      await this.emailService.sendEmailVerification(
        user.email,
        emailToken,
        user.name,
      );

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      };
    } catch (error) {
      this.logger.error('User registration failed', {
        email: registerDto.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Login user with email and password
   * @param loginDto - User login credentials
   * @returns JWT token and user data
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log('User login attempt', { email: loginDto.email });

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn('Login failed - user not found', {
        email: loginDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn('Login failed - invalid password', {
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log('User logged in successfully', { userId: user.id });

    // Generate JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.tokenService.generateRefreshToken(user.id);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const result = await this.tokenService.refreshAccessToken(
      refreshTokenDto.refresh_token,
    );

    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return result;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      this.logger.warn('Password reset requested for non-existent email', {
        email: forgotPasswordDto.email,
      });
      return;
    }

    const resetToken = await this.tokenService.generatePasswordResetToken(
      user.id,
    );
    await this.emailService.sendPasswordReset(
      user.email,
      resetToken,
      user.name,
    );

    this.logger.log('Password reset email sent', { userId: user.id });
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const userId = await this.tokenService.validatePasswordResetToken(
      resetPasswordDto.token,
    );

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.tokenService.usePasswordResetToken(resetPasswordDto.token);

    // Revoke all refresh tokens for security
    await this.tokenService.revokeAllRefreshTokens(userId);

    this.logger.log('Password reset successfully', { userId });
  }

  /**
   * Verify email using verification token
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const userId = await this.tokenService.validateEmailVerificationToken(
      verifyEmailDto.token,
    );

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    // Update user as verified
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark token as used
    await this.tokenService.useEmailVerificationToken(verifyEmailDto.token);

    this.logger.log('Email verified successfully', { userId });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    const emailToken = await this.tokenService.generateEmailVerificationToken(
      user.id,
    );
    await this.emailService.sendEmailVerification(
      user.email,
      emailToken,
      user.name,
    );

    this.logger.log('Email verification resent', { userId: user.id });
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    // The token service will handle validation and revocation
    await this.tokenService.refreshAccessToken(refreshToken);
    this.logger.log('User logged out');
  }

  /**
   * Validate user from JWT payload (used by Passport strategy)
   * @param payload - JWT payload
   * @returns User data without password
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
