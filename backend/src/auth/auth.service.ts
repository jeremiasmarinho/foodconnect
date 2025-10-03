import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
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
  ) {}

  /**
   * Register new user with email validation and password hashing
   * @param registerDto - User registration data
   * @returns JWT token and user data
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log('Starting user registration', {
      email: registerDto.email,
      username: registerDto.username,
    });

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          name: registerDto.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
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

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
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

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    };
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
