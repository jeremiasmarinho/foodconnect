import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Req,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  /**
   * Get current user profile (protected)
   * @param req - Request with user from JWT
   * @returns Current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    this.logger.log('Getting current user profile', { userId: req.user.id });
    return this.usersService.getUserById(req.user.id);
  }

  /**
   * Update current user profile (protected)
   * @param req - Request with user from JWT
   * @param updateUserDto - Update data
   * @returns Updated user profile
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log('Updating current user profile', { userId: req.user.id });
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  /**
   * Get all users with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated users list
   */
  @Get()
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Getting users list', { page, limit });
    return this.usersService.getUsers(page, Math.min(limit, 50)); // Max 50 per page
  }

  /**
   * Search users by name or username
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching users
   */
  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    this.logger.log('Searching users', { query });

    if (!query || query.trim().length < 2) {
      return { data: [], message: 'Query must be at least 2 characters long' };
    }

    return {
      data: await this.usersService.searchUsers(
        query.trim(),
        Math.min(limit, 20),
      ),
    };
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User public profile
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    this.logger.log('Getting user by ID', { userId: id });
    return this.usersService.getUserById(id);
  }

  /**
   * Get user by username
   * @param username - Username
   * @returns User public profile
   */
  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    this.logger.log('Getting user by username', { username });
    return this.usersService.getUserByUsername(username);
  }

  /**
   * Get enhanced user profile with statistics
   * GET /users/:id/profile?currentUserId=xxx
   */
  @Get(':id/profile')
  async getUserProfile(
    @Param('id') userId: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    this.logger.log('Getting user profile with stats', {
      userId,
      currentUserId,
    });
    return this.usersService.getUserProfile(userId, currentUserId);
  }

  /**
   * Follow or unfollow a user (protected)
   * POST /users/:id/follow
   */
  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async toggleFollow(@Param('id') followingId: string, @Request() req) {
    this.logger.log('Toggle follow user', {
      followerId: req.user.id,
      followingId,
    });

    const result = await this.usersService.toggleFollow(
      req.user.id,
      followingId,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get user followers
   * GET /users/:id/followers?page=1&limit=20
   */
  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Getting user followers', { userId, page, limit });

    const result = await this.usersService.getFollowers(
      userId,
      page,
      Math.min(limit, 50),
    );

    return {
      success: true,
      message: 'Followers retrieved successfully',
      data: result.followers,
      meta: result.meta,
    };
  }

  /**
   * Get users that the user is following
   * GET /users/:id/following?page=1&limit=20
   */
  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.logger.log('Getting user following', { userId, page, limit });

    const result = await this.usersService.getFollowing(
      userId,
      page,
      Math.min(limit, 50),
    );

    return {
      success: true,
      message: 'Following retrieved successfully',
      data: result.following,
      meta: result.meta,
    };
  }

  /**
   * Test follow/unfollow endpoint (without auth)
   * POST /users/:id/follow/test?followerId=xxx
   */
  @Post(':id/follow/test')
  async testToggleFollow(
    @Param('id') followingId: string,
    @Query('followerId') followerId: string,
  ) {
    if (!followerId) {
      return {
        success: false,
        message: 'followerId query parameter is required',
      };
    }

    this.logger.log('Test toggle follow user', { followerId, followingId });

    const result = await this.usersService.toggleFollow(
      followerId,
      followingId,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get complete user profile with posts, favorites, and achievements
   * GET /users/:id/complete-profile
   */
  @Get(':id/complete-profile')
  async getCompleteProfile(
    @Param('id') userId: string,
    @Query('viewerId') viewerId?: string,
  ) {
    this.logger.log('Getting complete user profile', { userId, viewerId });
    return this.usersService.getCompleteProfile(userId, viewerId);
  }

  /**
   * Add restaurant to favorites
   * POST /users/favorites/:restaurantId
   */
  @UseGuards(JwtAuthGuard)
  @Post('favorites/:restaurantId')
  async addFavoriteRestaurant(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    this.logger.log('Adding restaurant to favorites', {
      userId: req.user.id,
      restaurantId,
    });
    return this.usersService.addFavoriteRestaurant(req.user.id, restaurantId);
  }

  /**
   * Remove restaurant from favorites
   * DELETE /users/favorites/:restaurantId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:restaurantId')
  async removeFavoriteRestaurant(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    this.logger.log('Removing restaurant from favorites', {
      userId: req.user.id,
      restaurantId,
    });
    return this.usersService.removeFavoriteRestaurant(
      req.user.id,
      restaurantId,
    );
  }

  /**
   * Get user's favorite restaurants
   * GET /users/my/favorites
   */
  @UseGuards(JwtAuthGuard)
  @Get('my/favorites')
  async getMyFavoriteRestaurants(@Req() req) {
    this.logger.log('Getting user favorites', { userId: req.user.id });
    return this.usersService.getFavoriteRestaurants(req.user.id);
  }

  /**
   * Update user bio
   * PATCH /users/my/bio
   */
  @UseGuards(JwtAuthGuard)
  @Patch('my/bio')
  async updateBio(@Req() req, @Body('bio') bio: string) {
    this.logger.log('Updating user bio', { userId: req.user.id });
    return this.usersService.updateBio(req.user.id, bio);
  }
}
