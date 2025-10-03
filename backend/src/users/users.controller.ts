import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
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
}
