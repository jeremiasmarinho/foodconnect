import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @returns JWT token and user information
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log('Registration attempt', { email: registerDto.email });
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * @param loginDto - Login credentials
   * @returns JWT token and user information
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log('Login attempt', { email: loginDto.email });
    return this.authService.login(loginDto);
  }

  /**
   * Get current user profile (protected route)
   * @param req - Request object with user data from JWT
   * @returns Current user profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    const user = req.user as {
      id: string;
      email: string;
      username: string;
      name: string;
      createdAt: Date;
    };
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  /**
   * Health check for auth service
   * @returns Auth service status
   */
  @Get('health')
  healthCheck() {
    return {
      service: 'auth',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
