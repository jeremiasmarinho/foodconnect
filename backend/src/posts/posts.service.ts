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
import { DateUtils } from '../common/utils/date.utils';

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
      establishmentId: createPostDto.establishmentId,
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
          establishment: {
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

      return this.mapToPostResponseDto(post);
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
      establishment: {
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
    return this.mapToPostResponseDto(post);
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
          establishment: {
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
      return this.mapToPostResponseDto(updatedPost);
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
   * Get feed posts with advanced filtering and pagination
   * @param query - Advanced filter query parameters
   * @param userId - Optional user ID for personalized feed
   * @returns Paginated posts feed with filters
   */
  async getFeedWithFilters(
    query: any,
    userId?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      cuisine,
      city,
      state,
      minRating,
      minLikes,
      timeFilter,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Convert string parameters to numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const minRatingNum =
      typeof minRating === 'string' ? parseFloat(minRating) : minRating;
    const minLikesNum =
      typeof minLikes === 'string' ? parseInt(minLikes, 10) : minLikes;

    this.logger.log('Fetching filtered posts feed', {
      page: pageNum,
      limit: limitNum,
      search,
      cuisine,
      city,
      state,
      minRating: minRatingNum,
      minLikes: minLikesNum,
      timeFilter,
      sortBy,
      sortOrder,
      userId,
    });

    const skip = (pageNum - 1) * limitNum;
    const where: any = {};

    // Text search
    if (search && search.trim()) {
      where.OR = [
        { content: { contains: search } },
        { establishment: { name: { contains: search } } },
      ];
    }

    // Restaurant filters
    // Post rating filter
    if (minRatingNum) {
      where.rating = { gte: minRatingNum };
    }

    // Restaurant filters
    const restaurantWhere: any = {};
    if (cuisine) {
      restaurantWhere.cuisine = { contains: cuisine };
    }
    if (city) {
      restaurantWhere.city = { contains: city };
    }
    if (state) {
      restaurantWhere.state = { contains: state };
    }

    if (Object.keys(restaurantWhere).length > 0) {
      where.restaurant = restaurantWhere;
    }

    // Time filters
    if (timeFilter && timeFilter !== 'all') {
      const now = new Date();
      let timeThreshold: Date;

      switch (timeFilter) {
        case 'today':
          timeThreshold = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case 'week':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          timeThreshold = new Date(0);
      }

      where.createdAt = { gte: timeThreshold };
    }

    // Set up ordering
    let orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy = { rating: sortOrder };
    } else if (sortBy === 'likes') {
      orderBy = { likes: { _count: sortOrder } };
    } else if (sortBy === 'comments') {
      orderBy = { comments: { _count: sortOrder } };
    } else {
      orderBy = { createdAt: sortOrder };
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
              bio: true,
            },
          },
          establishment: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              imageUrl: true,
              cuisine: true,
              rating: true,
            },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
          comments: {
            take: 3,
            orderBy: { createdAt: 'asc' },
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

    // Apply likes filter after query (if needed)
    let filteredPosts = posts;
    if (minLikesNum) {
      filteredPosts = posts.filter((post) => post._count.likes >= minLikesNum);
    }

    // Process posts to add computed fields and map to DTO
    const processedPosts = filteredPosts.map((post) => {
      const processedPost = {
        ...post,
        isLikedByUser: userId ? post.likes && post.likes.length > 0 : false,
        timeAgo: DateUtils.timeAgo(post.createdAt),
      };
      return this.mapToPostResponseDto(processedPost);
    });

    const result = new PaginatedResponseDto(
      processedPosts,
      total,
      pageNum,
      limitNum,
    );

    this.logger.log('Filtered feed retrieved', {
      totalFound: total,
      filteredCount: processedPosts.length,
      appliedFilters: {
        cuisine,
        city,
        state,
        minRating: minRatingNum,
        minLikes: minLikesNum,
        timeFilter,
      },
    });

    return result;
  }

  /**
   * Get personalized feed based on user interactions and preferences
   * @param query - Pagination and search parameters
   * @param userId - User ID for personalization
   * @returns Personalized paginated posts feed
   */
  async getPersonalizedFeed(
    query: PaginationQueryDto,
    userId: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { page = 1, limit = 10, search } = query;

    this.logger.log('Fetching personalized feed', {
      page,
      limit,
      search,
      userId,
    });

    const skip = (page - 1) * limit;

    // Get user's interaction data for personalization
    const userInteractions = await this.getUserInteractionData(userId);

    // Get posts with basic ordering (will be re-sorted by personalization score)
    const personalizedPosts = await this.prisma.post.findMany({
      skip: 0, // Get more posts for better personalization
      take: limit * 3, // Get 3x posts to have better selection for personalization
      where:
        search && search.trim()
          ? {
              OR: [
                { content: { contains: search } },
                {
                  establishment: {
                    OR: [
                      { name: { contains: search } },
                      { cuisine: { contains: search } },
                      { city: { contains: search } },
                    ],
                  },
                },
                { user: { username: { contains: search } } },
              ],
            }
          : undefined,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            imageUrl: true,
            cuisine: true,
            rating: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
        comments: {
          take: 3,
          orderBy: { createdAt: 'asc' },
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get total count for pagination
    const total = await this.prisma.post.count({
      where:
        search && search.trim()
          ? {
              OR: [
                { content: { contains: search } },
                {
                  establishment: {
                    OR: [
                      { name: { contains: search } },
                      { cuisine: { contains: search } },
                      { city: { contains: search } },
                    ],
                  },
                },
                { user: { username: { contains: search } } },
              ],
            }
          : undefined,
    });

    // Apply personalization scoring and re-sort
    const scoredPosts = this.scorePostsForPersonalization(
      personalizedPosts,
      userInteractions,
    );

    const processedPosts = scoredPosts.map((post) => ({
      ...post,
      isLikedByUser: userId ? post.likes && post.likes.length > 0 : false,
      timeAgo: DateUtils.timeAgo(post.createdAt),
    }));

    const result = new PaginatedResponseDto(processedPosts, total, page, limit);

    this.logger.log('Personalized feed retrieved', {
      totalFound: total,
      userId,
      personalizedFactors: {
        favoriteCuisines: userInteractions.favoriteCuisines,
        interactedRestaurants: userInteractions.interactedRestaurants.length,
        likedPosts: userInteractions.likedPostIds.length,
      },
    });

    return result;
  }

  /**
   * Get user interaction data for personalization
   */
  private async getUserInteractionData(userId: string) {
    // Get user's liked posts to understand preferences
    const likedPosts = await this.prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            establishment: {
              select: { cuisine: true, id: true },
            },
          },
        },
      },
      take: 50, // Last 50 likes for analysis
      orderBy: { id: 'desc' },
    });

    // Get user's commented posts
    const commentedPosts = await this.prisma.comment.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            establishment: {
              select: { cuisine: true, id: true },
            },
          },
        },
      },
      take: 30, // Last 30 comments for analysis
      orderBy: { id: 'desc' },
    });

    // Analyze favorite cuisines based on interactions
    const cuisineInteractions = new Map<string, number>();
    const restaurantInteractions = new Map<string, number>();

    // Count likes by cuisine (weight: 2)
    likedPosts.forEach((like) => {
      if (!like.post.establishment) return;
      const cuisine = like.post.establishment.cuisine;
      const establishmentId = like.post.establishment.id;

      if (cuisine) {
        cuisineInteractions.set(
          cuisine,
          (cuisineInteractions.get(cuisine) || 0) + 2,
        );
      }
      restaurantInteractions.set(
        establishmentId,
        (restaurantInteractions.get(establishmentId) || 0) + 2,
      );
    });

    // Count comments by cuisine (weight: 1)
    commentedPosts.forEach((comment) => {
      if (!comment.post.establishment) return;
      const cuisine = comment.post.establishment.cuisine;
      const establishmentId = comment.post.establishment.id;

      if (cuisine) {
        cuisineInteractions.set(
          cuisine,
          (cuisineInteractions.get(cuisine) || 0) + 1,
        );
      }
      restaurantInteractions.set(
        establishmentId,
        (restaurantInteractions.get(establishmentId) || 0) + 1,
      );
    });

    // Get top 3 favorite cuisines
    const favoriteCuisines = Array.from(cuisineInteractions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Get top interacted restaurants
    const interactedRestaurants = Array.from(restaurantInteractions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    // Get followed users for feed prioritization
    const followedUsers = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      take: 100, // Max 100 followed users for performance
    });

    const followedUserIds = followedUsers.map((follow) => follow.followingId);

    return {
      favoriteCuisines,
      interactedRestaurants,
      likedPostIds: likedPosts.map((like) => like.postId),
      followedUserIds,
    };
  }

  /**
   * Score posts for personalization based on user preferences
   */
  private scorePostsForPersonalization(posts: any[], userInteractions: any) {
    return posts
      .map((post) => {
        let score = 0;

        // Base score from post metrics
        score += post._count.likes * 0.3; // Likes weight
        score += post._count.comments * 0.2; // Comments weight
        score += post.rating * 0.1; // Post rating weight

        // Cuisine preference bonus
        if (
          userInteractions.favoriteCuisines.includes(post.establishment.cuisine)
        ) {
          score += 10; // Strong preference bonus
        }

        // Restaurant interaction bonus
        if (
          userInteractions.interactedRestaurants.includes(post.establishment.id)
        ) {
          score += 5; // Restaurant familiarity bonus
        }

        // Following users bonus (posts from followed users get priority)
        if (userInteractions.followedUserIds.includes(post.userId)) {
          score += 15; // Strong bonus for posts from followed users
        }

        // Recency bonus (posts from last 24 hours get boost)
        const hoursAgo =
          (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 24) {
          score += 3;
        } else if (hoursAgo < 72) {
          score += 1;
        }

        return { ...post, personalizationScore: score };
      })
      .sort((a, b) => b.personalizationScore - a.personalizationScore);
  }

  /**
   * Get feed posts with pagination and filtering with caching (legacy method)
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
        { establishment: { name: { contains: search, mode: 'insensitive' } } },
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
              bio: true,
            },
          },
          establishment: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              imageUrl: true,
              cuisine: true,
              rating: true,
            },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
          comments: {
            take: 3, // Show first 3 comments
            orderBy: { createdAt: 'asc' },
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

    // Process posts to add computed fields and map to DTO
    const processedPosts = posts.map((post) => {
      const processedPost = {
        ...post,
        isLikedByUser: userId ? post.likes && post.likes.length > 0 : false,
        timeAgo: DateUtils.timeAgo(post.createdAt),
      };
      return this.mapToPostResponseDto(processedPost);
    });

    const result = new PaginatedResponseDto(processedPosts, total, page, limit);

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
          establishment: {
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
   * @param establishmentId - Restaurant ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Restaurant's posts with pagination
   */
  async getPostsByRestaurant(
    establishmentId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    this.logger.log('Fetching posts by restaurant', {
      establishmentId,
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { establishmentId },
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
          establishment: {
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
      this.prisma.post.count({ where: { establishmentId } }),
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
   * Like/Unlike a post with real-time feedback
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Like status, updated counts, and user feedback
   */
  async toggleLike(postId: string, userId: string) {
    this.logger.log('Toggling post like', { postId, userId });

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
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
      let result;

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

        // Get updated count
        const updatedPost = await this.prisma.post.findUnique({
          where: { id: postId },
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });

        this.logger.log('Post unliked', { postId, userId });

        result = {
          liked: false,
          action: 'unliked',
          message: 'Post unliked successfully',
          likesCount: updatedPost?._count.likes || 0,
          commentsCount: updatedPost?._count.comments || 0,
          postId,
          userId,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Like the post
        await this.prisma.like.create({
          data: {
            userId,
            postId,
          },
        });

        // Get updated count
        const updatedPost = await this.prisma.post.findUnique({
          where: { id: postId },
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        });

        // Send notification to post owner (don't await to improve performance)
        this.notificationsService
          .notifyPostLike(postId, userId)
          .catch((error) => {
            this.logger.warn('Failed to send like notification', {
              postId,
              userId,
              error: error.message,
            });
          });

        this.logger.log('Post liked', { postId, userId });

        result = {
          liked: true,
          action: 'liked',
          message: 'Post liked successfully',
          likesCount: updatedPost?._count.likes || 0,
          commentsCount: updatedPost?._count.comments || 0,
          postId,
          userId,
          timestamp: new Date().toISOString(),
        };
      }

      // Invalidate relevant caches
      await this.cacheService.del(`post:${postId}:*`);
      await this.cacheService.del(`feed:*`);

      return result;
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
              bio: true,
            },
          },
        },
      });

      // Get updated post counts
      const updatedPost = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      // Send notification to post owner (async for performance)
      this.notificationsService
        .notifyPostComment(postId, userId, content)
        .catch((error) => {
          this.logger.warn('Failed to send comment notification', {
            postId,
            userId,
            error: error.message,
          });
        });

      // Invalidate relevant caches
      await this.cacheService.del(`post:${postId}:*`);
      await this.cacheService.del(`feed:*`);

      this.logger.log('Comment added successfully', {
        postId,
        userId,
        commentId: comment.id,
      });

      return {
        ...comment,
        timeAgo: DateUtils.timeAgo(comment.createdAt),
        postCounts: {
          likes: updatedPost?._count.likes || 0,
          comments: updatedPost?._count.comments || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to add comment', {
        postId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Helper method to map Prisma post data to PostResponseDto
   */
  private mapToPostResponseDto(post: any): PostResponseDto {
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrls ? JSON.parse(post.imageUrls)[0] || null : null, // First image for backwards compatibility
      imageUrls: post.imageUrls,
      rating: post.rating,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.userId,
      restaurantId: post.establishmentId, // For backwards compatibility
      establishmentId: post.establishmentId,
      user: post.user,
      restaurant: post.establishment, // For backwards compatibility
      establishment: post.establishment,
      likes: post.likes,
      comments: post.comments,
      _count: post._count,
      isLikedByUser: post.isLikedByUser,
      timeAgo: post.timeAgo,
    };
  }
}
