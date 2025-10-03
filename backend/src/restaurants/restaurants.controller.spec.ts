import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;

  const mockRestaurant = {
    id: '1',
    name: 'Test Restaurant',
    description: 'A test restaurant',
    imageUrl: 'test.jpg',
    rating: 4.5,
    category: 'Italian',
    deliveryTime: '30-45 min',
    deliveryFee: 3.99,
    isOpen: true,
    address: '123 Test St',
    phone: '123-456-7890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRestaurantsService = {
    getRestaurants: jest.fn().mockResolvedValue({
      data: [mockRestaurant],
      pagination: { total: 1, pages: 1, current: 1 },
    }),
    getRestaurantById: jest.fn().mockResolvedValue(mockRestaurant),
    searchRestaurants: jest.fn().mockResolvedValue([mockRestaurant]),
    getNearbyRestaurants: jest.fn().mockResolvedValue([mockRestaurant]),
    seedRestaurants: jest.fn().mockResolvedValue({ count: 5 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: mockRestaurantsService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRestaurants', () => {
    it('should return paginated restaurants', async () => {
      const result = await controller.getRestaurants('1', '20');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockRestaurant]);
      expect(service.getRestaurants).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
      );
    });
  });

  describe('getRestaurantById', () => {
    it('should return a single restaurant', async () => {
      const result = await controller.getRestaurantById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRestaurant);
      expect(service.getRestaurantById).toHaveBeenCalledWith('1');
    });
  });

  describe('searchRestaurants', () => {
    it('should return restaurants matching search query', async () => {
      const result = await controller.searchRestaurants('pizza', '10');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockRestaurant]);
      expect(service.searchRestaurants).toHaveBeenCalledWith('pizza', 10);
    });

    it('should return error when query is empty', async () => {
      const result = await controller.searchRestaurants('', '10');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Search query is required');
    });
  });

  describe('getNearbyRestaurants', () => {
    it('should return nearby restaurants', async () => {
      const result = await controller.getNearbyRestaurants(
        '-23.5505',
        '-46.6333',
        '10',
        '20',
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockRestaurant]);
      expect(service.getNearbyRestaurants).toHaveBeenCalledWith(
        -23.5505,
        -46.6333,
        10,
        20,
      );
    });

    it('should return error when coordinates are missing', async () => {
      const result = await controller.getNearbyRestaurants('', '', '10', '20');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Latitude and longitude are required');
    });
  });
});
