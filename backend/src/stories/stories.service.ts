import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import {
  StoryResponseDto,
  UserStoriesResponseDto,
  HighlightResponseDto,
} from './dto/story-response.dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createStory(
    userId: string,
    createStoryDto: CreateStoryDto,
  ): Promise<StoryResponseDto> {
    const {
      content,
      mediaUrl,
      mediaType = 'image',
      establishmentId,
      location,
    } = createStoryDto;

    // Validate establishment exists if provided
    if (establishmentId) {
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId },
      });
      if (!establishment) {
        throw new NotFoundException('Establishment not found');
      }
    }

    // Create story with expiration time (24 hours from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await this.prisma.story.create({
      data: {
        userId,
        content,
        mediaUrl,
        mediaType,
        establishmentId,
        location,
        expiresAt,
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
            type: true,
            imageUrl: true,
          },
        },
        views: true,
      },
    });

    return this.mapToStoryResponse(story, userId);
  }

  async getActiveStories(
    currentUserId: string,
  ): Promise<UserStoriesResponseDto[]> {
    // Get stories from followed users + own stories
    const followedUsers = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const userIds = [currentUserId, ...followedUsers.map((f) => f.followingId)];

    const storiesData = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        stories: {
          some: {
            isActive: true,
            expiresAt: { gt: new Date() },
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        stories: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() },
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
                type: true,
                imageUrl: true,
              },
            },
            views: {
              select: {
                userId: true,
                viewedAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { viewedAt: 'desc' },
              take: 10, // Last 10 viewers
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        highlightedStories: {
          include: {
            story: {
              select: {
                id: true,
                mediaUrl: true,
                mediaType: true,
                content: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return storiesData.map((user) => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar || undefined,
      stories: user.stories.map((story) =>
        this.mapToStoryResponse(story, currentUserId),
      ),
      hasUnviewed: user.stories.some(
        (story) =>
          !story.views.some((view) => view.userId === currentUserId),
      ),
      highlights: user.highlightedStories.map((highlight) => ({
        id: highlight.id,
        userId: highlight.userId,
        storyId: highlight.storyId,
        title: highlight.title,
        coverImage: highlight.coverImage || undefined,
        createdAt: highlight.createdAt,
        order: highlight.order,
        story: {
          id: highlight.story.id,
          mediaUrl: highlight.story.mediaUrl,
          mediaType: highlight.story.mediaType,
          content: highlight.story.content || undefined,
        },
      })),
    }));
  }

  async viewStory(storyId: string, userId: string): Promise<void> {
    // Check if story exists and is active
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (!story.isActive || story.expiresAt < new Date()) {
      throw new BadRequestException('Story is no longer active');
    }

    // Create or update view record
    await this.prisma.storyView.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        storyId,
        userId,
      },
    });
  }

  async getUserStories(
    userId: string,
    currentUserId: string,
  ): Promise<UserStoriesResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        stories: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() },
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
                type: true,
                imageUrl: true,
              },
            },
            views: {
              select: {
                userId: true,
                viewedAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { viewedAt: 'desc' },
              take: 10,
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        highlightedStories: {
          include: {
            story: {
              select: {
                id: true,
                mediaUrl: true,
                mediaType: true,
                content: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar || undefined,
      stories: user.stories.map((story) =>
        this.mapToStoryResponse(story, currentUserId),
      ),
      hasUnviewed: user.stories.some(
        (story) =>
          !story.views.some((view) => view.userId === currentUserId),
      ),
      highlights: user.highlightedStories.map((highlight) => ({
        id: highlight.id,
        userId: highlight.userId,
        storyId: highlight.storyId,
        title: highlight.title,
        coverImage: highlight.coverImage || undefined,
        createdAt: highlight.createdAt,
        order: highlight.order,
        story: {
          id: highlight.story.id,
          mediaUrl: highlight.story.mediaUrl,
          mediaType: highlight.story.mediaType,
          content: highlight.story.content || undefined,
        },
      })),
    };
  }

  async createHighlight(
    userId: string,
    createHighlightDto: CreateHighlightDto,
  ): Promise<HighlightResponseDto> {
    const { storyId, title, coverImage, order = 0 } = createHighlightDto;

    // Check if story exists and belongs to user
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only highlight your own stories');
    }

    const highlight = await this.prisma.highlightedStory.create({
      data: {
        userId,
        storyId,
        title,
        coverImage,
        order,
      },
      include: {
        story: {
          select: {
            id: true,
            mediaUrl: true,
            mediaType: true,
            content: true,
          },
        },
      },
    });

    return {
      id: highlight.id,
      userId: highlight.userId,
      storyId: highlight.storyId,
      title: highlight.title,
      coverImage: highlight.coverImage || undefined,
      createdAt: highlight.createdAt,
      order: highlight.order,
      story: {
        id: highlight.story.id,
        mediaUrl: highlight.story.mediaUrl,
        mediaType: highlight.story.mediaType,
        content: highlight.story.content || undefined,
      },
    };
  }

  async deleteStory(storyId: string, userId: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.prisma.story.update({
      where: { id: storyId },
      data: { isActive: false },
    });
  }

  async deleteHighlight(highlightId: string, userId: string): Promise<void> {
    const highlight = await this.prisma.highlightedStory.findUnique({
      where: { id: highlightId },
    });

    if (!highlight) {
      throw new NotFoundException('Highlight not found');
    }

    if (highlight.userId !== userId) {
      throw new ForbiddenException('You can only delete your own highlights');
    }

    await this.prisma.highlightedStory.delete({
      where: { id: highlightId },
    });
  }

  // Cleanup expired stories (to be called by a cron job)
  async cleanupExpiredStories(): Promise<number> {
    const result = await this.prisma.story.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: { isActive: false },
    });

    return result.count;
  }

  private mapToStoryResponse(story: any, currentUserId: string): StoryResponseDto {
    const hasViewed = story.views?.some((view: any) => view.userId === currentUserId) || false;
    const isOwner = story.userId === currentUserId;

    return {
      id: story.id,
      userId: story.userId,
      content: story.content || undefined,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
      isActive: story.isActive,
      establishmentId: story.establishmentId || undefined,
      location: story.location || undefined,
      user: {
        id: story.user.id,
        username: story.user.username,
        name: story.user.name,
        avatar: story.user.avatar || undefined,
      },
      establishment: story.establishment ? {
        id: story.establishment.id,
        name: story.establishment.name,
        type: story.establishment.type,
        imageUrl: story.establishment.imageUrl || undefined,
      } : undefined,
      viewCount: story.views?.length || 0,
      hasViewed,
      recentViewers: isOwner ? story.views?.map((view: any) => ({
        id: view.user.id,
        username: view.user.username,
        name: view.user.name,
        avatar: view.user.avatar || undefined,
        viewedAt: view.viewedAt,
      })) : undefined,
    };
  }
}