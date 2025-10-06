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
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from './dto/restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  private readonly logger = new Logger(RestaurantsController.name);

  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * Seed restaurants with mock data (Development only)
   * POST /restaurants/seed
   */
  @Post('seed')
  async seedRestaurants() {
    this.logger.log('Seeding restaurants with mock data');

    const mockRestaurants = [
      {
        name: 'Pizza Prime',
        description:
          'As melhores pizzas artesanais da cidade com ingredientes frescos e massa fermentada naturalmente.',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        phone: '(11) 99999-1234',
        email: 'contato@pizzaprime.com.br',
        category: 'pizza',
        cuisine: 'Italiana',
        rating: 4.8,
        deliveryTime: '25-35 min',
        deliveryFee: 4.99,
        minimumOrder: 25.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        latitude: -23.5505,
        longitude: -46.6333,
      },
      {
        name: 'Burger House',
        description:
          'Hambúrgueres gourmet com carne artesanal, pães brioche e molhos especiais da casa.',
        address: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        phone: '(11) 99999-2345',
        email: 'pedidos@burgerhouse.com.br',
        category: 'burger',
        cuisine: 'Americana',
        rating: 4.6,
        deliveryTime: '30-40 min',
        deliveryFee: 6.5,
        minimumOrder: 30.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        latitude: -23.5615,
        longitude: -46.6565,
      },
      {
        name: 'Sushi Zen',
        description:
          'Culinária japonesa autêntica com peixes frescos importados e receitas tradicionais.',
        address: 'Rua da Liberdade, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01503-001',
        phone: '(11) 99999-3456',
        email: 'sac@sushizen.com.br',
        category: 'sushi',
        cuisine: 'Japonesa',
        rating: 4.9,
        deliveryTime: '40-50 min',
        deliveryFee: 8.9,
        minimumOrder: 45.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        latitude: -23.5582,
        longitude: -46.6342,
      },
      {
        name: 'Café Moinho',
        description:
          'Cafés especiais, doces artesanais e um ambiente aconchegante para qualquer hora do dia.',
        address: 'Rua Augusta, 321',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000',
        phone: '(11) 99999-4567',
        email: 'hello@cafemoinho.com.br',
        category: 'coffee',
        cuisine: 'Cafeteria',
        rating: 4.7,
        deliveryTime: '15-25 min',
        deliveryFee: 3.5,
        minimumOrder: 15.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        latitude: -23.5489,
        longitude: -46.6623,
      },
      {
        name: 'Green Bowl',
        description:
          'Alimentação saudável com pratos nutritivos, saladas frescas e smoothies naturais.',
        address: 'Rua Consolação, 987',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01301-000',
        phone: '(11) 99999-6789',
        email: 'info@greenbowl.com.br',
        category: 'healthy',
        cuisine: 'Saudável',
        rating: 4.4,
        deliveryTime: '25-35 min',
        deliveryFee: 4.5,
        minimumOrder: 28.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        latitude: -23.5458,
        longitude: -46.6597,
      },
    ];

    try {
      const createdRestaurants: any[] = [];

      for (const restaurantData of mockRestaurants) {
        const restaurant =
          await this.restaurantsService.createRestaurant(restaurantData);
        createdRestaurants.push(restaurant);
      }

      return {
        success: true,
        message: `Successfully seeded ${createdRestaurants.length} restaurants`,
        data: createdRestaurants,
      };
    } catch (error) {
      this.logger.error('Error seeding restaurants:', error);
      throw error;
    }
  }

  /**
   * Create a new restaurant
   * POST /restaurants
   */
  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteRestaurant(@Param('id') id: string) {
    this.logger.log('Deleting restaurant', { restaurantId: id });

    await this.restaurantsService.deleteRestaurant(id);

    return {
      success: true,
      message: 'Restaurant deleted successfully',
    };
  }

  /**
   * Get all restaurants with pagination and filters
   * GET /restaurants?page=1&limit=20&search=pizza&sortBy=rating&sortOrder=desc
   */
  @Get()
  async getRestaurants(@Query() query: PaginationQueryDto) {
    this.logger.log('Fetching restaurants list', query);

    const result = await this.restaurantsService.getRestaurants(query);

    return {
      message: 'Restaurants retrieved successfully',
      data: result.data,
      meta: result.meta,
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

    const restaurants = await this.restaurantsService.findNearby(
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
