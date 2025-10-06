import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser1 = {
    id: 'user1',
    email: 'user1@test.com',
    username: 'user1',
    name: 'User One',
    avatar: null,
    bio: 'Bio for user one',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      posts: 5,
      followers: 0,
      follows: 0,
    },
  };

  const mockUser2 = {
    id: 'user2',
    email: 'user2@test.com',
    username: 'user2',
    name: 'User Two',
    avatar: null,
    bio: 'Bio for user two',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      posts: 3,
      followers: 0,
      follows: 0,
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFollow', () => {
    it('should follow a user when not already following', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser1) // follower
        .mockResolvedValueOnce(mockUser2); // following

      mockPrismaService.follow.findUnique.mockResolvedValue(null); // not following
      mockPrismaService.follow.create.mockResolvedValue({
        id: 'follow1',
        followerId: 'user1',
        followingId: 'user2',
      });

      // Act
      const result = await service.toggleFollow('user1', 'user2');

      // Assert
      expect(result).toEqual({
        isFollowing: true,
        action: 'followed',
        message: 'User followed successfully',
        follower: { id: 'user1', username: 'user1', name: 'User One' },
        following: { id: 'user2', username: 'user2', name: 'User Two' },
      });

      expect(mockPrismaService.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: 'user1',
          followingId: 'user2',
        },
      });
    });

    it('should unfollow a user when already following', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser1) // follower
        .mockResolvedValueOnce(mockUser2); // following

      mockPrismaService.follow.findUnique.mockResolvedValue({
        id: 'follow1',
        followerId: 'user1',
        followingId: 'user2',
      }); // already following

      mockPrismaService.follow.delete.mockResolvedValue({});

      // Act
      const result = await service.toggleFollow('user1', 'user2');

      // Assert
      expect(result).toEqual({
        isFollowing: false,
        action: 'unfollowed',
        message: 'User unfollowed successfully',
        follower: { id: 'user1', username: 'user1', name: 'User One' },
        following: { id: 'user2', username: 'user2', name: 'User Two' },
      });

      expect(mockPrismaService.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: 'user1',
            followingId: 'user2',
          },
        },
      });
    });

    it('should throw ConflictException when user tries to follow themselves', async () => {
      // Act & Assert
      await expect(service.toggleFollow('user1', 'user1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when follower does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // follower not found
        .mockResolvedValueOnce(mockUser2); // following exists

      // Act & Assert
      await expect(service.toggleFollow('invalid', 'user2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when following user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser1) // follower exists
        .mockResolvedValueOnce(null); // following not found

      // Act & Assert
      await expect(service.toggleFollow('user1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFollowers', () => {
    it('should return paginated followers list', async () => {
      // Arrange
      const mockFollowers = [
        {
          follower: {
            id: 'user1',
            username: 'user1',
            name: 'User One',
            avatar: null,
            bio: 'Bio one',
            createdAt: new Date(),
          },
        },
      ];

      mockPrismaService.follow.findMany.mockResolvedValue(mockFollowers);
      mockPrismaService.follow.count.mockResolvedValue(1);

      // Act
      const result = await service.getFollowers('user2', 1, 20);

      // Assert
      expect(result).toEqual({
        followers: [mockFollowers[0].follower],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('getFollowing', () => {
    it('should return paginated following list', async () => {
      // Arrange
      const mockFollowing = [
        {
          following: {
            id: 'user2',
            username: 'user2',
            name: 'User Two',
            avatar: null,
            bio: 'Bio two',
            createdAt: new Date(),
          },
        },
      ];

      mockPrismaService.follow.findMany.mockResolvedValue(mockFollowing);
      mockPrismaService.follow.count.mockResolvedValue(1);

      // Act
      const result = await service.getFollowing('user1', 1, 20);

      // Assert
      expect(result).toEqual({
        following: [mockFollowing[0].following],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile with stats and follow status', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser2);
      mockPrismaService.follow.findUnique.mockResolvedValue({
        id: 'follow1',
        followerId: 'user1',
        followingId: 'user2',
      });

      // Act
      const result = await service.getUserProfile('user2', 'user1');

      // Assert
      expect(result).toEqual({
        ...mockUser2,
        stats: {
          postsCount: 3,
          followersCount: 0,
          followingCount: 0,
        },
        isFollowing: true,
        isOwnProfile: false,
      });
    });

    it('should return own profile with isOwnProfile=true', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser1);

      // Act
      const result = await service.getUserProfile('user1', 'user1');

      // Assert
      expect(result.isOwnProfile).toBe(true);
      expect(result.isFollowing).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserProfile('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isFollowing', () => {
    it('should return true when user is following', async () => {
      // Arrange
      mockPrismaService.follow.findUnique.mockResolvedValue({
        id: 'follow1',
        followerId: 'user1',
        followingId: 'user2',
      });

      // Act
      const result = await service.isFollowing('user1', 'user2');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user is not following', async () => {
      // Arrange
      mockPrismaService.follow.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.isFollowing('user1', 'user2');

      // Assert
      expect(result).toBe(false);
    });
  });
});
