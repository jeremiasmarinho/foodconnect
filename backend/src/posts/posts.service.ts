import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, PostResponseDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

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
   * Get post by ID with full details
   * @param id - Post ID
   * @returns Post with user, restaurant, likes and comments count
   */
  async getPostById(id: string): Promise<PostResponseDto> {
    this.logger.log('Fetching post by ID', { postId: id });

    const post = await this.prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      this.logger.warn('Post not found', { postId: id });
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

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
   * Get feed posts with pagination (all posts ordered by creation date)
   * @param page - Page number
   * @param limit - Items per page
   * @param userId - Optional user ID for personalized feed
   * @returns Paginated posts feed
   */
  async getFeed(page: number = 1, limit: number = 20, userId?: string) {
    this.logger.log('Fetching posts feed', { page, limit, userId });

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
      this.prisma.post.count(),
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
}
