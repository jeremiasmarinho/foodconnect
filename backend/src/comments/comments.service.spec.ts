import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockPost = {
    id: 'post-123',
    userId: 'user-456',
    content: 'Test post',
  };

  const mockComment = {
    id: 'comment-789',
    content: 'Great post!',
    userId: 'user-111',
    postId: 'post-123',
    createdAt: new Date(),
    user: {
      id: 'user-111',
      username: 'testuser',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment('user-111', 'post-123', {
        content: 'Great post!',
      });

      expect(result).toEqual({
        id: mockComment.id,
        content: mockComment.content,
        createdAt: mockComment.createdAt,
        userId: mockComment.userId,
        postId: mockComment.postId,
        user: mockComment.user,
      });

      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-123' },
      });

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Great post!',
          userId: 'user-111',
          postId: 'post-123',
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
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment('user-111', 'invalid-post', {
          content: 'Test comment',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments for a post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getCommentsByPostId('post-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockComment.id,
        content: mockComment.content,
        createdAt: mockComment.createdAt,
        userId: mockComment.userId,
        postId: mockComment.postId,
        user: mockComment.user,
      });

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 'post-123' },
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
          createdAt: 'desc',
        },
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.getCommentsByPostId('invalid-post')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no comments exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.comment.findMany.mockResolvedValue([]);

      const result = await service.getCommentsByPostId('post-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      await service.deleteComment('comment-789', 'user-111');

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-789' },
      });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteComment('invalid-comment', 'user-111'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the comment author', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.deleteComment('comment-789', 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCommentCount', () => {
    it('should return comment count for a post', async () => {
      mockPrismaService.comment.count.mockResolvedValue(5);

      const result = await service.getCommentCount('post-123');

      expect(result).toBe(5);
      expect(mockPrismaService.comment.count).toHaveBeenCalledWith({
        where: { postId: 'post-123' },
      });
    });

    it('should return 0 if no comments exist', async () => {
      mockPrismaService.comment.count.mockResolvedValue(0);

      const result = await service.getCommentCount('post-123');

      expect(result).toBe(0);
    });
  });
});
