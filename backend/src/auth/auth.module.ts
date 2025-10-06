import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d', // 7 days for user convenience
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, EmailService, JwtStrategy],
  exports: [AuthService, TokenService, EmailService, JwtModule],
})
export class AuthModule {}
