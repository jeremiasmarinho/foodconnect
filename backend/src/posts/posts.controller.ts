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
  async getFeed(@Query() query: PaginationQueryDto) {
    this.logger.log('Fetching posts feed', { query });

    const result = await this.postsService.getFeed(query);

    return {
      success: true,
      message: 'Feed retrieved successfully',
      data: result.data,
      meta: result.meta,
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
    liked: boolean;
  }> {
    this.logger.log('Toggling post like', {
      postId,
      userId: req.user.id,
    });

    const result = await this.postsService.toggleLike(postId, req.user.id);

    return {
      success: true,
      message: result.message,
      liked: result.liked,
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
}
