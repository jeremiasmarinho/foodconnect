import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(private prisma: PrismaService) {}

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
   * Get all restaurants with pagination and optional filtering
   * @param page - Page number
   * @param limit - Items per page
   * @param city - Filter by city
   * @param state - Filter by state
   * @returns Paginated restaurants list
   */
  async getRestaurants(
    page: number = 1,
    limit: number = 20,
    city?: string,
    state?: string,
  ) {
    this.logger.log('Fetching restaurants list', {
      page,
      limit,
      city,
      state,
    });

    const skip = (page - 1) * limit;
    const where: any = {};

    if (city) {
      where.city = { contains: city };
    }

    if (state) {
      where.state = { contains: state };
    }

    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        skip,
        take: limit,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + limit < total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
