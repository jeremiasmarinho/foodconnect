import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SearchQueryDto,
  SearchType,
  SearchResponse,
  UserSearchResult,
  PostSearchResult,
  RestaurantSearchResult,
} from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Universal search across all entities
   */
  async search(
    searchDto: SearchQueryDto,
    currentUserId?: string,
  ): Promise<SearchResponse> {
    const { query, type = SearchType.ALL, page = 1, limit = 20 } = searchDto;
    const skip = (page - 1) * limit;

    this.logger.log(`Searching for: "${query}" (type: ${type})`);

    // Route to specific search based on type
    switch (type) {
      case SearchType.USERS:
        return this.searchUsers(query, skip, limit, currentUserId);
      case SearchType.POSTS:
        return this.searchPosts(query, skip, limit, currentUserId);
      case SearchType.RESTAURANTS:
        return this.searchRestaurants(query, skip, limit);
      case SearchType.ALL:
      default:
        return this.searchAll(query, skip, limit, currentUserId);
    }
  }

  /**
   * Search users by username, name, email, or bio
   */
  private async searchUsers(
    query: string,
    skip: number,
    limit: number,
    currentUserId?: string,
  ): Promise<SearchResponse> {
    const searchTerm = query.toLowerCase();

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm } },
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
          ],
        },
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          followers: {
            select: { id: true },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { username: { contains: searchTerm } },
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    // Check if current user is following these users
    let followingIds: string[] = [];
    if (currentUserId) {
      const following = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: users.map((u) => u.id) },
        },
        select: { followingId: true },
      });
      followingIds = following.map((f) => f.followingId);
    }

    const results: UserSearchResult[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      followersCount: user.followers.length,
      isFollowing: followingIds.includes(user.id),
      type: 'user' as const,
    }));

    return {
      results,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      hasMore: skip + users.length < total,
      type: SearchType.USERS,
    };
  }

  /**
   * Search posts by content
   */
  private async searchPosts(
    query: string,
    skip: number,
    limit: number,
    currentUserId?: string,
  ): Promise<SearchResponse> {
    const searchTerm = query.toLowerCase();

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          content: { contains: searchTerm },
        },
        skip,
        take: limit,
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
            },
          },
          likes: {
            select: { id: true },
          },
          comments: {
            select: { id: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.post.count({
        where: {
          content: { contains: searchTerm },
        },
      }),
    ]);

    const results: PostSearchResult[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      imageUrls: JSON.parse(post.imageUrls),
      createdAt: post.createdAt,
      user: {
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        avatar: post.user.avatar || undefined,
      },
      establishment: post.establishment
        ? {
            id: post.establishment.id,
            name: post.establishment.name,
          }
        : undefined,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      type: 'post' as const,
    }));

    return {
      results,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      hasMore: skip + posts.length < total,
      type: SearchType.POSTS,
    };
  }

  /**
   * Search restaurants by name, description, cuisine, city
   */
  private async searchRestaurants(
    query: string,
    skip: number,
    limit: number,
  ): Promise<SearchResponse> {
    const searchTerm = query.toLowerCase();

    const [restaurants, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { cuisine: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { address: { contains: searchTerm } },
          ],
        },
        skip,
        take: limit,
        orderBy: {
          rating: 'desc',
        },
      }),
      this.prisma.establishment.count({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { cuisine: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { address: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    const results: RestaurantSearchResult[] = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description || undefined,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      cuisine: restaurant.cuisine || undefined,
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      imageUrl: restaurant.imageUrl || undefined,
      type: 'restaurant' as const,
    }));

    return {
      results,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      hasMore: skip + restaurants.length < total,
      type: SearchType.RESTAURANTS,
    };
  }

  /**
   * Search across all entities (combined results)
   */
  private async searchAll(
    query: string,
    skip: number,
    limit: number,
    currentUserId?: string,
  ): Promise<SearchResponse> {
    // For "all" search, we'll take a smaller limit from each category
    const limitPerCategory = Math.floor(limit / 3);

    const [users, posts, restaurants] = await Promise.all([
      this.searchUsers(query, 0, limitPerCategory, currentUserId),
      this.searchPosts(query, 0, limitPerCategory, currentUserId),
      this.searchRestaurants(query, 0, limitPerCategory),
    ]);

    // Combine results
    const allResults = [
      ...users.results,
      ...posts.results,
      ...restaurants.results,
    ];

    const total = users.total + posts.total + restaurants.total;

    return {
      results: allResults,
      total,
      page: 1, // Combined search doesn't support pagination well
      limit: allResults.length,
      hasMore: total > allResults.length,
      type: SearchType.ALL,
    };
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();

    // Get top usernames matching the query
    const users = await this.prisma.user.findMany({
      where: {
        username: { contains: searchTerm },
      },
      take: limit,
      select: { username: true },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
    });

    return users.map((u) => u.username);
  }
}
