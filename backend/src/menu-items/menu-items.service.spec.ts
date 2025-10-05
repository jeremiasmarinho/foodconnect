import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from './menu-items.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

describe('MenuItemsService', () => {
  let service: MenuItemsService;
  let prismaService: PrismaService;

  // Mock data
  const mockRestaurant = {
    id: 'restaurant-1',
    name: 'Test Restaurant',
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
  };

  const mockMenuItem = {
    id: 'menu-item-1',
    name: 'Test Pizza',
    description: 'Delicious test pizza',
    price: 25.99,
    category: 'pizza',
    imageUrl: 'https://example.com/pizza.jpg',
    isAvailable: true,
    restaurantId: 'restaurant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    restaurant: mockRestaurant,
  };

  const mockPrismaService = {
    menuItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMenuItemDto: CreateMenuItemDto = {
      name: 'Test Pizza',
      description: 'Delicious test pizza',
      price: 25.99,
      category: 'pizza',
      imageUrl: 'https://example.com/pizza.jpg',
      isAvailable: true,
      restaurantId: 'restaurant-1',
    };

    it('should create a new menu item successfully', async () => {
      mockPrismaService.menuItem.create.mockResolvedValue(mockMenuItem);

      const result = await service.create(createMenuItemDto);

      expect(mockPrismaService.menuItem.create).toHaveBeenCalledWith({
        data: createMenuItemDto,
        include: {
          restaurant: true,
        },
      });

      expect(result).toEqual(mockMenuItem);
    });

    it('should handle database errors during menu item creation', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.menuItem.create.mockRejectedValue(error);

      await expect(service.create(createMenuItemDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const mockMenuItems = [mockMenuItem];
      mockPrismaService.menuItem.findMany.mockResolvedValue(mockMenuItems);

      const result = await service.findAll();

      expect(mockPrismaService.menuItem.findMany).toHaveBeenCalledWith({
        include: {
          restaurant: true,
        },
      });

      expect(result).toEqual(mockMenuItems);
    });

    it('should return empty array when no menu items exist', async () => {
      mockPrismaService.menuItem.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByRestaurant', () => {
    it('should return menu items for a specific restaurant', async () => {
      const restaurantMenuItems = [mockMenuItem];
      mockPrismaService.menuItem.findMany.mockResolvedValue(
        restaurantMenuItems,
      );

      const result = await service.findByRestaurant('restaurant-1');

      expect(mockPrismaService.menuItem.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        include: {
          restaurant: true,
        },
      });

      expect(result).toEqual(restaurantMenuItems);
    });

    it('should return empty array when restaurant has no menu items', async () => {
      mockPrismaService.menuItem.findMany.mockResolvedValue([]);

      const result = await service.findByRestaurant('restaurant-with-no-items');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific menu item by id', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(mockMenuItem);

      const result = await service.findOne('menu-item-1');

      expect(mockPrismaService.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'menu-item-1' },
        include: {
          restaurant: true,
        },
      });

      expect(result).toEqual(mockMenuItem);
    });

    it('should return null when menu item does not exist', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateMenuItemDto: UpdateMenuItemDto = {
      name: 'Updated Pizza',
      price: 29.99,
      isAvailable: false,
    };

    it('should update a menu item successfully', async () => {
      const updatedMenuItem = { ...mockMenuItem, ...updateMenuItemDto };
      mockPrismaService.menuItem.update.mockResolvedValue(updatedMenuItem);

      const result = await service.update('menu-item-1', updateMenuItemDto);

      expect(mockPrismaService.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'menu-item-1' },
        data: updateMenuItemDto,
        include: {
          restaurant: true,
        },
      });

      expect(result).toEqual(updatedMenuItem);
    });

    it('should handle errors when updating non-existent menu item', async () => {
      const error = new Error('Menu item not found');
      mockPrismaService.menuItem.update.mockRejectedValue(error);

      await expect(
        service.update('non-existent-id', updateMenuItemDto),
      ).rejects.toThrow('Menu item not found');
    });
  });

  describe('remove', () => {
    it('should delete a menu item successfully', async () => {
      mockPrismaService.menuItem.delete.mockResolvedValue(mockMenuItem);

      const result = await service.remove('menu-item-1');

      expect(mockPrismaService.menuItem.delete).toHaveBeenCalledWith({
        where: { id: 'menu-item-1' },
      });

      expect(result).toEqual(mockMenuItem);
    });

    it('should handle errors when deleting non-existent menu item', async () => {
      const error = new Error('Menu item not found');
      mockPrismaService.menuItem.delete.mockRejectedValue(error);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Menu item not found',
      );
    });
  });
});
