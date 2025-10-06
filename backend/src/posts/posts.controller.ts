import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, PostResponseDto } from './dto/post.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  /**
   * Create a new post
   * POST /posts
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: PostResponseDto;
  }> {
    this.logger.log('Creating post', {
      userId: req.user.id,
      restaurantId: createPostDto.restaurantId,
    });

    const post = await this.postsService.createPost(req.user.id, createPostDto);

    return {
      success: true,
      message: 'Post created successfully',
      data: post,
    };
  }

  /**
   * Get post by ID
   * GET /posts/:id
   */
  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    data: PostResponseDto;
  }> {
    this.logger.log('Fetching post by ID', { postId: id });

    const post = await this.postsService.getPostById(id);

    return {
      success: true,
      message: 'Post retrieved successfully',
      data: post,
    };
  }

  /**
   * Update post
   * PUT /posts/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: PostResponseDto;
  }> {
    this.logger.log('Updating post', {
      postId: id,
      userId: req.user.id,
    });

    const post = await this.postsService.updatePost(
      id,
      req.user.id,
      updatePostDto,
    );

    return {
      success: true,
      message: 'Post updated successfully',
      data: post,
    };
  }

  /**
   * Delete post
   * DELETE /posts/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string, @Request() req): Promise<void> {
    this.logger.log('Deleting post', {
      postId: id,
      userId: req.user.id,
    });

    await this.postsService.deletePost(id, req.user.id);
  }

  /**
   * Get feed posts (public timeline)
   * GET /posts/feed?page=1&limit=20
   */
  @Get('feed/timeline')
  async getFeed(
    @Query() query: PaginationQueryDto,
    @Query('userId') userId?: string,
  ) {
    this.logger.log('Fetching posts feed', { query, userId });

    const result = await this.postsService.getFeed(query, userId);

    return {
      success: true,
      message: 'Feed retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get filtered feed
   * GET /posts/feed/filtered?cuisine=italiana&city=São Paulo&minRating=4
   */
  @Get('feed/filtered')
  async getFilteredFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('cuisine') cuisine?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('minRating') minRating?: string,
    @Query('minLikes') minLikes?: string,
    @Query('timeFilter') timeFilter?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('userId') userId?: string,
  ) {
    const query = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      cuisine,
      city,
      state,
      minRating: minRating ? parseFloat(minRating) : undefined,
      minLikes: minLikes ? parseInt(minLikes, 10) : undefined,
      timeFilter,
      sortBy,
      sortOrder,
    };

    this.logger.log('Fetching filtered posts feed', { query, userId });

    const result = await this.postsService.getFeedWithFilters(query, userId);

    return {
      success: true,
      message: 'Filtered feed retrieved successfully',
      data: result.data,
      meta: result.meta,
      filters: {
        cuisine,
        city,
        state,
        minRating,
        minLikes,
        timeFilter,
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Get personalized feed based on user interactions
   * GET /posts/feed/personalized?page=1&limit=10&userId=xxx
   */
  @Get('feed/personalized')
  async getPersonalizedFeed(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException(
        'User ID is required for personalized feed',
      );
    }

    const query = {
      page,
      limit: Math.min(limit, 50),
      search,
    };

    this.logger.log('Fetching personalized feed', { query, userId });

    const result = await this.postsService.getPersonalizedFeed(query, userId);

    return {
      success: true,
      message: 'Personalized feed retrieved successfully',
      data: result.data,
      meta: result.meta,
      personalization: {
        userId,
        algorithm: 'interaction-based',
        version: '1.0',
      },
    };
  }

  /**
   * Get posts by user
   * GET /posts/user/:userId?page=1&limit=20
   */
  @Get('user/:userId')
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Fetching posts by user', { userId, page, limit });

    const result = await this.postsService.getPostsByUser(
      userId,
      page,
      Math.min(limit, 50),
    );

    return {
      success: true,
      message: 'User posts retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * Get posts by restaurant
   * GET /posts/restaurant/:restaurantId?page=1&limit=20
   */
  @Get('restaurant/:restaurantId')
  async getPostsByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Fetching posts by restaurant', {
      restaurantId,
      page,
      limit,
    });

    const result = await this.postsService.getPostsByRestaurant(
      restaurantId,
      page,
      Math.min(limit, 50),
    );

    return {
      success: true,
      message: 'Restaurant posts retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * Like/Unlike a post
   * POST /posts/:id/like
   */
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Param('id') postId: string,
    @Request() req,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    this.logger.log('Toggling post like', {
      postId,
      userId: req.user.id,
    });

    const result = await this.postsService.toggleLike(postId, req.user.id);

    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  /**
   * Test Like/Unlike a post (without auth for testing)
   * POST /posts/:id/like/test?userId=xxx
   */
  @Post(':id/like/test')
  @HttpCode(HttpStatus.OK)
  async testToggleLike(
    @Param('id') postId: string,
    @Query('userId') userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    this.logger.log('Testing post like toggle', { postId, userId });

    if (!userId) {
      return {
        success: false,
        message: 'userId query parameter is required',
        data: null,
      };
    }

    const result = await this.postsService.toggleLike(postId, userId);

    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  /**
   * Get current user's posts (protected)
   * GET /posts/me?page=1&limit=20
   */
  @Get('me/posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Fetching current user posts', {
      userId: req.user.id,
      page,
      limit,
    });

    const result = await this.postsService.getPostsByUser(
      req.user.id,
      page,
      Math.min(limit, 50),
    );

    return {
      success: true,
      message: 'My posts retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * Add comment to a post
   * POST /posts/:id/comment
   */
  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') postId: string,
    @Request() req,
    @Body('content') content: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    this.logger.log('Adding comment to post', {
      postId,
      userId: req.user.id,
    });

    const comment = await this.postsService.addComment(
      postId,
      req.user.id,
      content,
    );

    return {
      success: true,
      message: 'Comment added successfully',
      data: comment,
    };
  }

  /**
   * Test Add comment to a post (without auth for testing)
   * POST /posts/:id/comment/test?userId=xxx&content=xxx
   */
  @Post(':id/comment/test')
  @HttpCode(HttpStatus.CREATED)
  async testAddComment(
    @Param('id') postId: string,
    @Query('userId') userId: string,
    @Query('content') content: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    this.logger.log('Testing add comment to post', { postId, userId, content });

    if (!userId || !content) {
      return {
        success: false,
        message: 'userId and content query parameters are required',
        data: null,
      };
    }

    const comment = await this.postsService.addComment(postId, userId, content);

    return {
      success: true,
      message: 'Comment added successfully',
      data: comment,
    };
  }
}
