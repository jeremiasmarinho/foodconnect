import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  // Mock data
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  };

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
    restaurantId: 'restaurant-1',
  };

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    restaurantId: 'restaurant-1',
    status: 'pending',
    total: 25.99,
    subtotal: 25.99,
    deliveryFee: 0,
    deliveryAddress: '123 Test St',
    notes: 'Ring doorbell',
    estimatedTime: '25-35 min',
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [
      {
        id: 'order-item-1',
        orderId: 'order-1',
        menuItemId: 'menu-item-1',
        quantity: 1,
        price: 25.99,
        notes: null,
        menuItem: mockMenuItem,
      },
    ],
    restaurant: mockRestaurant,
    user: mockUser,
  };

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      restaurantId: 'restaurant-1',
      total: 25.99,
      subtotal: 25.99,
      deliveryFee: 0,
      deliveryAddress: '123 Test St',
      notes: 'Ring doorbell',
      orderItems: [
        {
          menuItemId: 'menu-item-1',
          quantity: 1,
          price: 25.99,
        },
      ],
    };

    it('should create a new order successfully', async () => {
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create('user-1', createOrderDto);

      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          restaurantId: 'restaurant-1',
          total: 25.99,
          subtotal: 25.99,
          deliveryFee: 0,
          deliveryAddress: '123 Test St',
          notes: 'Ring doorbell',
          userId: 'user-1',
          orderItems: {
            create: createOrderDto.orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          restaurant: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockOrder);
    });

    it('should handle database errors during order creation', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.order.create.mockRejectedValue(error);

      await expect(service.create('user-1', createOrderDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [mockOrder];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          restaurant: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockOrders);
    });

    it('should return empty array when no orders exist', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific order by id', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          restaurant: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockOrder);
    });

    it('should return null when order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return orders for a specific user', async () => {
      const userOrders = [mockOrder];
      mockPrismaService.order.findMany.mockResolvedValue(userOrders);

      const result = await service.findByUser('user-1');

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          restaurant: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(userOrders);
    });

    it('should return empty array when user has no orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.findByUser('user-with-no-orders');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateOrderDto: UpdateOrderDto = {
      status: 'confirmed',
      estimatedTime: '20-25 min',
      notes: 'Updated instructions',
    };

    it('should update an order successfully', async () => {
      const updatedOrder = { ...mockOrder, ...updateOrderDto };
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.update('order-1', updateOrderDto);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: updateOrderDto,
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          restaurant: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(updatedOrder);
    });

    it('should handle errors when updating non-existent order', async () => {
      const error = new Error('Order not found');
      mockPrismaService.order.update.mockRejectedValue(error);

      await expect(
        service.update('non-existent-id', updateOrderDto),
      ).rejects.toThrow('Order not found');
    });
  });

  describe('remove', () => {
    it('should delete an order successfully', async () => {
      mockPrismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.remove('order-1');

      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });

      expect(result).toEqual(mockOrder);
    });

    it('should handle errors when deleting non-existent order', async () => {
      const error = new Error('Order not found');
      mockPrismaService.order.delete.mockRejectedValue(error);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Order not found',
      );
    });
  });
});
