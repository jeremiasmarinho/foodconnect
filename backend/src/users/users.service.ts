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
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log('Updating user profile', {
      userId: id,
      updates: Object.keys(updateUserDto),
    });

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
                updateUserDto.username
                  ? { username: updateUserDto.username }
                  : {},
              ].filter((condition) => Object.keys(condition).length > 0),
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
        OR: [{ name: { contains: query } }, { username: { contains: query } }],
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

  /**
   * Follow or unfollow a user
   * @param followerId - ID of the user doing the following
   * @param followingId - ID of the user being followed
   * @returns Follow status and relationship info
   */
  async toggleFollow(followerId: string, followingId: string) {
    this.logger.log('Toggling follow relationship', {
      followerId,
      followingId,
    });

    if (followerId === followingId) {
      throw new ConflictException('Users cannot follow themselves');
    }

    // Check if both users exist
    const [follower, following] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      throw new NotFoundException('One or both users not found');
    }

    // Check if follow relationship already exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      this.logger.log('User unfollowed successfully', {
        followerId,
        followingId,
      });

      return {
        isFollowing: false,
        action: 'unfollowed',
        message: 'User unfollowed successfully',
        follower: {
          id: follower.id,
          username: follower.username,
          name: follower.name,
        },
        following: {
          id: following.id,
          username: following.username,
          name: following.name,
        },
      };
    } else {
      // Follow
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      this.logger.log('User followed successfully', {
        followerId,
        followingId,
      });

      return {
        isFollowing: true,
        action: 'followed',
        message: 'User followed successfully',
        follower: {
          id: follower.id,
          username: follower.username,
          name: follower.name,
        },
        following: {
          id: following.id,
          username: following.username,
          name: following.name,
        },
      };
    }
  }

  /**
   * Get user's followers
   * @param userId - ID of the user
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns List of followers with pagination
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    this.logger.log('Fetching user followers', { userId, page, limit });

    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      followers: followers.map((follow) => follow.follower),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get users that the user is following
   * @param userId - ID of the user
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns List of following with pagination
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    this.logger.log('Fetching user following', { userId, page, limit });

    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      following: following.map((follow) => follow.following),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get user profile with follow statistics
   * @param userId - ID of the user
   * @param currentUserId - Optional ID of current user to check follow status
   * @returns Enhanced user profile with stats
   */
  async getUserProfile(userId: string, currentUserId?: string) {
    this.logger.log('Fetching enhanced user profile', {
      userId,
      currentUserId,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            follows: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRelation = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!followRelation;
    }

    return {
      ...user,
      stats: {
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.follows,
      },
      isFollowing,
      isOwnProfile: currentUserId === userId,
    };
  }

  /**
   * Check if user A is following user B
   * @param followerId - ID of potential follower
   * @param followingId - ID of potential following
   * @returns Boolean indicating follow status
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }

  /**
   * Get complete user profile with posts, favorites, and achievements
   */
  async getCompleteProfile(userId: string, viewerId?: string) {
    // Get basic profile
    const profile = await this.getUserProfile(userId, viewerId);

    // Get user's posts
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12, // Limit to most recent 12 posts
    });

    // Get favorite restaurants (placeholder until models are ready)
    const favoriteRestaurants: any[] = [];

    // Get user achievements (placeholder until models are ready)
    const achievements: any[] = [];

    return {
      ...profile,
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrls ? JSON.parse(post.imageUrls)[0] || null : null,
        createdAt: post.createdAt,
        restaurant: post.establishment, // For backwards compatibility
        establishment: post.establishment,
        stats: {
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
        },
      })),
      favoriteRestaurants: [],
      achievements: [],
    };
  }

  /**
   * Add restaurant to user's favorites
   * TODO: Implement after Prisma client is regenerated
   */
  async addFavoriteRestaurant(userId: string, restaurantId: string) {
    return {
      message:
        'Funcionalidade em desenvolvimento - Prisma client needs regeneration',
      data: null,
    };
  }

  /**
   * Remove restaurant from user's favorites
   * TODO: Implement after Prisma client is regenerated
   */
  async removeFavoriteRestaurant(userId: string, restaurantId: string) {
    return {
      message:
        'Funcionalidade em desenvolvimento - Prisma client needs regeneration',
    };
  }

  /**
   * Get user's favorite restaurants
   * TODO: Implement after Prisma client is regenerated
   */
  async getFavoriteRestaurants(userId: string) {
    return {
      data: [],
      count: 0,
    };
  }

  /**
   * Update user bio
   */
  async updateBio(userId: string, bio: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { bio },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
      },
    });

    return {
      message: 'Bio atualizada com sucesso',
      data: user,
    };
  }
}
