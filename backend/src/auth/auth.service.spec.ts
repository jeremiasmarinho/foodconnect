import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Mock data
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    password: 'hashedPassword123',
    avatar: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserResponse = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      // Mock no existing user
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      // Mock password hashing
      mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      // Mock user creation
      mockPrismaService.user.create.mockResolvedValue(mockUserResponse);
      // Mock JWT signing
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: registerDto.email },
            { username: registerDto.username },
          ],
        },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          name: registerDto.name,
          password: 'hashedPassword123',
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          createdAt: true,
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = { ...mockUser, email: 'test@example.com' };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      const existingUser = {
        ...mockUser,
        email: 'different@example.com', // Different email
        username: 'testuser', // Same username
      };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already taken',
      );
    });

    it('should handle database errors during registration', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      const error = new Error('Database connection failed');
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('validateUser', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
    };

    const mockValidateResponse = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      avatar: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate and return user data', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidateResponse);

      const result = await service.validateUser(payload);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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

      expect(result).toEqual(mockValidateResponse);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(payload)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
