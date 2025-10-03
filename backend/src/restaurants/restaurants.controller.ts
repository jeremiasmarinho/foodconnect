import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from './dto/restaurant.dto';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  private readonly logger = new Logger(RestaurantsController.name);

  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * Create a new restaurant
   * POST /restaurants
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRestaurant(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: RestaurantResponseDto;
  }> {
    this.logger.log('Creating restaurant', {
      name: createRestaurantDto.name,
      city: createRestaurantDto.city,
    });

    const restaurant =
      await this.restaurantsService.createRestaurant(createRestaurantDto);

    return {
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    };
  }

  /**
   * Get restaurant by ID
   * GET /restaurants/:id
   */
  @Get(':id')
  async getRestaurantById(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
    data: RestaurantResponseDto;
  }> {
    this.logger.log('Fetching restaurant by ID', { restaurantId: id });

    const restaurant = await this.restaurantsService.getRestaurantById(id);

    return {
      success: true,
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    };
  }

  /**
   * Update restaurant
   * PUT /restaurants/:id
   */
  @Put(':id')
  async updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: RestaurantResponseDto;
  }> {
    this.logger.log('Updating restaurant', {
      restaurantId: id,
      updates: Object.keys(updateRestaurantDto),
    });

    const restaurant = await this.restaurantsService.updateRestaurant(
      id,
      updateRestaurantDto,
    );

    return {
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    };
  }

  /**
   * Delete restaurant
   * DELETE /restaurants/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRestaurant(@Param('id') id: string): Promise<void> {
    this.logger.log('Deleting restaurant', { restaurantId: id });

    await this.restaurantsService.deleteRestaurant(id);
  }

  /**
   * Get all restaurants with pagination and filtering
   * GET /restaurants?page=1&limit=20&city=São Paulo&state=SP
   */
  @Get()
  async getRestaurants(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    this.logger.log('Fetching restaurants list', {
      page: parseInt(page),
      limit: parseInt(limit),
      city,
      state,
    });

    const result = await this.restaurantsService.getRestaurants(
      parseInt(page),
      parseInt(limit),
      city,
      state,
    );

    return {
      success: true,
      message: 'Restaurants retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * Search restaurants by name or description
   * GET /restaurants/search?q=pizza&limit=10
   */
  @Get('search/query')
  async searchRestaurants(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    this.logger.log('Searching restaurants', {
      query,
      limit: parseInt(limit),
    });

    if (!query) {
      return {
        success: false,
        message: 'Search query is required',
        data: [],
      };
    }

    const restaurants = await this.restaurantsService.searchRestaurants(
      query,
      parseInt(limit),
    );

    return {
      success: true,
      message: `Found ${restaurants.length} restaurants`,
      data: restaurants,
    };
  }

  /**
   * Get restaurants near a location
   * GET /restaurants/nearby?lat=-23.5505&lng=-46.6333&radius=10&limit=20
   */
  @Get('nearby/location')
  async getNearbyRestaurants(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius: string = '10',
    @Query('limit') limit: string = '20',
  ) {
    this.logger.log('Finding nearby restaurants', {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      limit: parseInt(limit),
    });

    if (!latitude || !longitude) {
      return {
        success: false,
        message: 'Latitude and longitude are required',
        data: [],
      };
    }

    const restaurants = await this.restaurantsService.getNearbyRestaurants(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius),
      parseInt(limit),
    );

    return {
      success: true,
      message: `Found ${restaurants.length} nearby restaurants`,
      data: restaurants,
    };
  }
}
