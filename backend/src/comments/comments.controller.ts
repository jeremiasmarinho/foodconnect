import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CommentResponseDto } from './dto/comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Create a new comment on a post
   * POST /posts/:postId/comments
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('postId') postId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: CommentResponseDto;
  }> {
    this.logger.log('Creating comment', {
      postId,
      userId: req.user.id,
    });

    const comment = await this.commentsService.createComment(
      req.user.id,
      postId,
      createCommentDto,
    );

    return {
      success: true,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  /**
   * Get all comments for a post
   * GET /posts/:postId/comments
   */
  @Get()
  async getComments(@Param('postId') postId: string): Promise<{
    success: boolean;
    message: string;
    data: CommentResponseDto[];
  }> {
    this.logger.log('Fetching comments', { postId });

    const comments = await this.commentsService.getCommentsByPostId(postId);

    return {
      success: true,
      message: 'Comments retrieved successfully',
      data: comments,
    };
  }

  /**
   * Delete a comment
   * DELETE /posts/:postId/comments/:commentId
   */
  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ): Promise<void> {
    this.logger.log('Deleting comment', {
      postId,
      commentId,
      userId: req.user.id,
    });

    await this.commentsService.deleteComment(commentId, req.user.id);
  }
}
