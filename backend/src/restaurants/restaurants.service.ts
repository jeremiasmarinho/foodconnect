import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from './dto/restaurant.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dto/pagination.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Create a new restaurant
   * @param createRestaurantDto - Restaurant data
   * @returns Created restaurant
   */
  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    this.logger.log('Creating new restaurant', {
      name: createRestaurantDto.name,
      city: createRestaurantDto.city,
    });

    try {
      const restaurant = await this.prisma.restaurant.create({
        data: createRestaurantDto,
      });

      this.logger.log('Restaurant created successfully', {
        restaurantId: restaurant.id,
        name: restaurant.name,
      });

      return restaurant;
    } catch (error) {
      this.logger.error('Failed to create restaurant', {
        name: createRestaurantDto.name,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   * @param id - Restaurant ID
   * @returns Restaurant details
   */
  async getRestaurantById(id: string): Promise<RestaurantResponseDto> {
    this.logger.log('Fetching restaurant by ID', { restaurantId: id });

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      this.logger.warn('Restaurant not found', { restaurantId: id });
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  /**
   * Update restaurant
   * @param id - Restaurant ID
   * @param updateRestaurantDto - Update data
   * @returns Updated restaurant
   */
  async updateRestaurant(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    this.logger.log('Updating restaurant', {
      restaurantId: id,
      updates: Object.keys(updateRestaurantDto),
    });

    // Check if restaurant exists
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existingRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    try {
      const updatedRestaurant = await this.prisma.restaurant.update({
        where: { id },
        data: updateRestaurantDto,
      });

      this.logger.log('Restaurant updated successfully', {
        restaurantId: id,
      });

      return updatedRestaurant;
    } catch (error) {
      this.logger.error('Failed to update restaurant', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete restaurant
   * @param id - Restaurant ID
   */
  async deleteRestaurant(id: string): Promise<void> {
    this.logger.log('Deleting restaurant', { restaurantId: id });

    // Check if restaurant exists
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existingRestaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    try {
      await this.prisma.restaurant.delete({
        where: { id },
      });

      this.logger.log('Restaurant deleted successfully', {
        restaurantId: id,
      });
    } catch (error) {
      this.logger.error('Failed to delete restaurant', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all restaurants with pagination and filtering
   * @param query - Pagination and filter query parameters
   * @returns Paginated restaurants list
   */
  async getRestaurants(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RestaurantResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Generate cache key
    const cacheKey = this.cacheService.getRestaurantsKey(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );

    // Try to get from cache first
    const cachedResult =
      await this.cacheService.get<PaginatedResponseDto<RestaurantResponseDto>>(
        cacheKey,
      );
    if (cachedResult) {
      this.logger.log('Restaurants retrieved from cache', { cacheKey });
      return cachedResult;
    }

    this.logger.log('Fetching restaurants from database', {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    const skip = (page - 1) * limit;
    const where: { [key: string]: unknown } = {};

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Set up ordering
    const orderBy: { [key: string]: string } = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    const result = new PaginatedResponseDto(restaurants, total, page, limit);

    // Cache the result for 5 minutes
    await this.cacheService.set(cacheKey, result, 300);

    this.logger.log('Restaurants fetched and cached successfully', {
      total,
      page,
      limit,
      resultsCount: restaurants.length,
      cacheKey,
    });

    return result;
  }

  /**
   * Search restaurants by name or description
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching restaurants
   */
  async searchRestaurants(query: string, limit: number = 10) {
    this.logger.log('Searching restaurants', { query, limit });

    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return restaurants;
  }

  /**
   * Get restaurants near a location (simplified version for SQLite)
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum results
   * @returns Nearby restaurants
   */
  async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20,
  ) {
    this.logger.log('Finding nearby restaurants', {
      latitude,
      longitude,
      radiusKm,
      limit,
    });

    // For SQLite, we'll do a simple approximation
    // In production with PostgreSQL, use PostGIS for accurate geospatial queries
    const latRange = radiusKm / 111; // Rough km to degree conversion
    const lngRange = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          {
            latitude: {
              gte: latitude - latRange,
              lte: latitude + latRange,
            },
          },
          {
            longitude: {
              gte: longitude - lngRange,
              lte: longitude + lngRange,
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return restaurants;
  }
}
