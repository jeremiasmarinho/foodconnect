import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get cached value
   * @param key - Cache key
   * @returns Cached value or null
   */
  async get<T>(key: string): Promise<T | null> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? null;
  }

  /**
   * Set cache value
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete cached value
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache (implementation depends on cache store)
   */
  reset(): void {
    // Note: Reset functionality depends on the specific cache implementation
    // For Redis store, you might need to implement this differently
    console.log('Cache reset requested - implement per store type');
  }

  /**
   * Generate cache key for restaurants list
   * @param page - Page number
   * @param limit - Items per page
   * @param search - Search query
   * @param sortBy - Sort field
   * @param sortOrder - Sort order
   * @returns Cache key
   */
  getRestaurantsKey(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
  ): string {
    const searchKey = search ? `search:${search}` : '';
    const sortKey = sortBy ? `sort:${sortBy}:${sortOrder}` : '';
    return `restaurants:page:${page}:limit:${limit}:${searchKey}:${sortKey}`;
  }

  /**
   * Generate cache key for posts feed
   * @param page - Page number
   * @param limit - Items per page
   * @param search - Search query
   * @param sortBy - Sort field
   * @param sortOrder - Sort order
   * @param userId - Optional user ID for personalized feed
   * @returns Cache key
   */
  getPostsKey(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
    userId?: string,
  ): string {
    const searchKey = search ? `search:${search}` : '';
    const sortKey = sortBy ? `sort:${sortBy}:${sortOrder}` : '';
    const userKey = userId ? `user:${userId}` : '';
    return `posts:page:${page}:limit:${limit}:${searchKey}:${sortKey}:${userKey}`;
  }

  /**
   * Generate cache key for restaurant details
   * @param restaurantId - Restaurant ID
   * @returns Cache key
   */
  getRestaurantKey(restaurantId: string): string {
    return `restaurant:${restaurantId}`;
  }

  /**
   * Generate cache key for user data
   * @param userId - User ID
   * @returns Cache key
   */
  getUserKey(userId: string): string {
    return `user:${userId}`;
  }
}
