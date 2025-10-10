import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CommentResponseDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new comment on a post
   */
  async createComment(
    userId: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    this.logger.log(`Creating comment on post ${postId} by user ${userId}`);

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
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

    this.logger.log(`Comment created successfully: ${comment.id}`);

    // TODO: Create notification for post owner (when notification system is implemented)
    // if (post.userId !== userId) {
    //   await this.notificationsService.createNotification({
    //     userId: post.userId,
    //     type: 'COMMENT',
    //     message: `${comment.user.username} commented on your post`,
    //     relatedId: comment.id,
    //   });
    // }

    return this.mapToCommentResponse(comment);
  }

  /**
   * Get all comments for a post
   */
  async getCommentsByPostId(postId: string): Promise<CommentResponseDto[]> {
    this.logger.log(`Fetching comments for post ${postId}`);

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId },
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
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
    });

    this.logger.log(`Found ${comments.length} comments for post ${postId}`);

    return comments.map((comment) => this.mapToCommentResponse(comment));
  }

  /**
   * Delete a comment
   * Only the comment author can delete their own comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting comment ${commentId} by user ${userId}`);

    // Find comment
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Verify ownership
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete comment
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    this.logger.log(`Comment ${commentId} deleted successfully`);
  }

  /**
   * Get comment count for a post
   */
  async getCommentCount(postId: string): Promise<number> {
    const count = await this.prisma.comment.count({
      where: { postId },
    });

    return count;
  }

  /**
   * Map database comment to response DTO
   */
  private mapToCommentResponse(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      userId: comment.userId,
      postId: comment.postId,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        name: comment.user.name,
        avatar: comment.user.avatar,
      },
    };
  }
}
