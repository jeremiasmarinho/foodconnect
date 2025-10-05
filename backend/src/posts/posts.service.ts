import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, PostResponseDto } from './dto/post.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dto/pagination.dto';
import { CacheService } from '../cache/cache.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new post
   * @param userId - User creating the post
   * @param createPostDto - Post data
   * @returns Created post with user and restaurant data
   */
  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    this.logger.log('Creating new post', {
      userId,
      restaurantId: createPostDto.restaurantId,
      hasRating: !!createPostDto.rating,
    });

    try {
      const post = await this.prisma.post.create({
        data: {
          ...createPostDto,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
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
      });

      this.logger.log('Post created successfully', {
        postId: post.id,
        userId,
      });

      return post;
    } catch (error) {
      this.logger.error('Failed to create post', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get post by ID with optimized queries and caching
   * @param id - Post ID
   * @param includeComments - Whether to include comments (default: false for performance)
   * @returns Post with user, restaurant, likes and comments count
   */
  async getPostById(
    id: string,
    includeComments = false,
  ): Promise<PostResponseDto> {
    this.logger.log('Fetching post by ID', { postId: id, includeComments });

    // Try cache first for basic post data
    const cacheKey = `post:${id}:${includeComments ? 'with-comments' : 'basic'}`;
    const cachedPost = await this.cacheService.get<PostResponseDto>(cacheKey);

    if (cachedPost) {
      this.logger.log('Post retrieved from cache', { postId: id });
      return cachedPost;
    }

    const baseInclude = {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
          imageUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    };

    const includeOptions = includeComments
      ? {
          ...baseInclude,
          comments: {
            take: 10, // Limit comments for performance
            orderBy: { createdAt: 'desc' as const },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        }
      : baseInclude;

    const post = await this.prisma.post.findUnique({
      where: { id },
      include: includeOptions,
    });

    if (!post) {
      this.logger.warn('Post not found', { postId: id });
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Cache for 5 minutes (posts can change frequently with likes/comments)
    await this.cacheService.set(cacheKey, post, 300);

    this.logger.log('Post retrieved from database and cached', { postId: id });
    return post;
  }

  /**
   * Update post (only by owner)
   * @param id - Post ID
   * @param userId - User attempting to update
   * @param updatePostDto - Update data
   * @returns Updated post
   */
  async updatePost(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    this.logger.log('Updating post', {
      postId: id,
      userId,
      updates: Object.keys(updatePostDto),
    });

    // Check if post exists and user owns it
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    try {
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
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
      });

      this.logger.log('Post updated successfully', { postId: id });
      return updatedPost;
    } catch (error) {
      this.logger.error('Failed to update post', {
        postId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete post (only by owner)
   * @param id - Post ID
   * @param userId - User attempting to delete
   */
  async deletePost(id: string, userId: string): Promise<void> {
    this.logger.log('Deleting post', { postId: id, userId });

    // Check if post exists and user owns it
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    try {
      await this.prisma.post.delete({
        where: { id },
      });

      this.logger.log('Post deleted successfully', { postId: id });
    } catch (error) {
      this.logger.error('Failed to delete post', {
        postId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get feed posts with pagination and filtering with caching
   * @param query - Pagination and filter query parameters
   * @param userId - Optional user ID for personalized feed
   * @returns Paginated posts feed
   */
  async getFeed(
    query: PaginationQueryDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    this.logger.log('Fetching posts feed', { page, limit, search, userId });

    // Generate cache key based on query parameters
    const cacheKey = `feed:${userId || 'public'}:${page}:${limit}:${search || 'all'}:${sortBy}:${sortOrder}`;

    // Try cache first for frequently accessed feeds
    const cachedFeed =
      await this.cacheService.get<PaginatedResponseDto<PostResponseDto>>(
        cacheKey,
      );
    if (cachedFeed) {
      this.logger.log('Feed retrieved from cache', {
        page,
        limit,
        search,
        userId: userId || 'public',
      });
      return cachedFeed;
    }

    const skip = (page - 1) * limit;
    const where: { [key: string]: unknown } = {};

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { restaurant: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Set up ordering
    const orderBy: { [key: string]: string } = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'likes') {
      orderBy.likesCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
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
      }),
      this.prisma.post.count({ where }),
    ]);

    const result = new PaginatedResponseDto(posts, total, page, limit);

    // Cache feed for 2 minutes (feeds change frequently)
    await this.cacheService.set(cacheKey, result, 120);

    this.logger.log('Feed retrieved from database and cached', {
      page,
      limit,
      search,
      userId: userId || 'public',
      totalPosts: total,
    });

    return result;
  }

  /**
   * Get posts by user (user's profile posts)
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User's posts with pagination
   */
  async getPostsByUser(userId: string, page: number = 1, limit: number = 20) {
    this.logger.log('Fetching posts by user', { userId, page, limit });

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
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
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      data: posts,
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
   * Get posts by restaurant
   * @param restaurantId - Restaurant ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Restaurant's posts with pagination
   */
  async getPostsByRestaurant(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    this.logger.log('Fetching posts by restaurant', {
      restaurantId,
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { restaurantId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
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
      }),
      this.prisma.post.count({ where: { restaurantId } }),
    ]);

    return {
      data: posts,
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
   * Like/Unlike a post
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Like status and updated counts
   */
  async toggleLike(postId: string, userId: string) {
    this.logger.log('Toggling post like', { postId, userId });

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user already liked this post
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    try {
      if (existingLike) {
        // Unlike the post
        await this.prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });

        this.logger.log('Post unliked', { postId, userId });

        return {
          liked: false,
          message: 'Post unliked successfully',
        };
      } else {
        // Like the post
        await this.prisma.like.create({
          data: {
            userId,
            postId,
          },
        });

        // Send notification to post owner
        await this.notificationsService.notifyPostLike(postId, userId);

        this.logger.log('Post liked', { postId, userId });

        return {
          liked: true,
          message: 'Post liked successfully',
        };
      }
    } catch (error) {
      this.logger.error('Failed to toggle like', {
        postId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Add comment to a post
   * @param postId - Post ID
   * @param userId - User ID who is commenting
   * @param content - Comment content
   * @returns Created comment with user data
   */
  async addComment(postId: string, userId: string, content: string) {
    this.logger.log('Adding comment to post', { postId, userId });

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    try {
      // Create the comment
      const comment = await this.prisma.comment.create({
        data: {
          content,
          userId,
          postId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Send notification to post owner
      await this.notificationsService.notifyPostComment(
        postId,
        userId,
        content,
      );

      this.logger.log('Comment added successfully', {
        postId,
        userId,
        commentId: comment.id,
      });

      return comment;
    } catch (error) {
      this.logger.error('Failed to add comment', {
        postId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}
