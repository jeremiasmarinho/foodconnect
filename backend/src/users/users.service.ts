import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get user by ID with public information only
   * @param id - User ID
   * @returns User public profile
   */
  async getUserById(id: string): Promise<UserResponseDto> {
    this.logger.log('Fetching user by ID', { userId: id });

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.warn('User not found', { userId: id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by username for public profiles
   * @param username - Username to search
   * @returns User public profile
   */
  async getUserByUsername(username: string): Promise<UserResponseDto> {
    this.logger.log('Fetching user by username', { username });

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.warn('User not found', { username });
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  /**
   * Update user profile
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user profile
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log('Updating user profile', { userId: id, updates: Object.keys(updateUserDto) });

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for conflicts if email or username is being updated
    if (updateUserDto.email || updateUserDto.username) {
      const conflicts = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Exclude current user
            {
              OR: [
                updateUserDto.email ? { email: updateUserDto.email } : {},
                updateUserDto.username ? { username: updateUserDto.username } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (conflicts) {
        if (conflicts.email === updateUserDto.email) {
          throw new ConflictException('Email already in use by another user');
        }
        if (conflicts.username === updateUserDto.username) {
          throw new ConflictException('Username already taken');
        }
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log('User profile updated successfully', { userId: id });
      return updatedUser;
    } catch (error) {
      this.logger.error('Failed to update user profile', {
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Paginated users list
   */
  async getUsers(page: number = 1, limit: number = 20) {
    this.logger.log('Fetching users list', { page, limit });

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          bio: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + limit < total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search users by name or username
   * @param query - Search query
   * @param limit - Maximum results (default: 10)
   * @returns Matching users
   */
  async searchUsers(query: string, limit: number = 10) {
    this.logger.log('Searching users', { query, limit });

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { username: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }
}