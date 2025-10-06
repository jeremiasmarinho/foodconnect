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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with email, password, username and name',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log('Registration attempt', { email: registerDto.email });
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiUnauthorizedResponse({ description: 'Authentication failed' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log('Login attempt', { email: loginDto.email });
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'johndoe' },
        name: { type: 'string', example: 'John Doe' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: any) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset email to user',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
  })
  async forgotPassword(@Body() forgotPasswordDto: any) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: any) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify user email using verification token',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Body() verifyEmailDto: any) {
    await this.authService.verifyEmail(verifyEmailDto);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend email verification',
    description: 'Resend email verification to user',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
  })
  @ApiUnauthorizedResponse({
    description: 'User not found or email already verified',
  })
  async resendVerification(@Body() body: { email: string }) {
    await this.authService.resendEmailVerification(body.email);
    return { message: 'Verification email sent' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Revoke refresh token and logout user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  async logout(@Body() body: { refresh_token: string }) {
    await this.authService.logout(body.refresh_token);
    return { message: 'Logged out successfully' };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Auth service health check',
    description: 'Check if the authentication service is running properly',
  })
  @ApiResponse({
    status: 200,
    description: 'Auth service is healthy',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string', example: 'auth' },
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  healthCheck() {
    return {
      service: 'auth',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
