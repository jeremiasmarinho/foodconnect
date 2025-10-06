import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import {
  StoryResponseDto,
  UserStoriesResponseDto,
  HighlightResponseDto,
} from './dto/story-response.dto';

@ApiTags('stories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiResponse({
    status: 201,
    description: 'Story created successfully',
    type: StoryResponseDto,
  })
  async createStory(
    @Request() req: any,
    @Body() createStoryDto: CreateStoryDto,
  ): Promise<StoryResponseDto> {
    return this.storiesService.createStory(req.user.id, createStoryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active stories from followed users' })
  @ApiResponse({
    status: 200,
    description: 'Active stories retrieved successfully',
    type: [UserStoriesResponseDto],
  })
  async getActiveStories(
    @Request() req: any,
  ): Promise<UserStoriesResponseDto[]> {
    return this.storiesService.getActiveStories(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get stories from a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User stories retrieved successfully',
    type: UserStoriesResponseDto,
  })
  async getUserStories(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<UserStoriesResponseDto> {
    return this.storiesService.getUserStories(userId, req.user.id);
  }

  @Post(':storyId/view')
  @ApiOperation({ summary: 'Mark a story as viewed' })
  @ApiResponse({ status: 200, description: 'Story marked as viewed' })
  async viewStory(
    @Param('storyId') storyId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.storiesService.viewStory(storyId, req.user.id);
    return { message: 'Story viewed successfully' };
  }

  @Delete(':storyId')
  @ApiOperation({ summary: 'Delete a story' })
  @ApiResponse({ status: 200, description: 'Story deleted successfully' })
  async deleteStory(
    @Param('storyId') storyId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.storiesService.deleteStory(storyId, req.user.id);
    return { message: 'Story deleted successfully' };
  }

  @Post('highlights')
  @ApiOperation({ summary: 'Create a story highlight' })
  @ApiResponse({
    status: 201,
    description: 'Highlight created successfully',
    type: HighlightResponseDto,
  })
  async createHighlight(
    @Request() req: any,
    @Body() createHighlightDto: CreateHighlightDto,
  ): Promise<HighlightResponseDto> {
    return this.storiesService.createHighlight(req.user.id, createHighlightDto);
  }

  @Delete('highlights/:highlightId')
  @ApiOperation({ summary: 'Delete a highlight' })
  @ApiResponse({ status: 200, description: 'Highlight deleted successfully' })
  async deleteHighlight(
    @Param('highlightId') highlightId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.storiesService.deleteHighlight(highlightId, req.user.id);
    return { message: 'Highlight deleted successfully' };
  }
}
