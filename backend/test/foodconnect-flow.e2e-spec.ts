import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('FoodConnect E2E Flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test data
  let authToken: string;
  let userId: string;
  let restaurantId: string;
  let menuItemId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prisma = app.get(PrismaService);

    await app.init();

    // Clean database before tests
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    await app.close();
  });

  describe('1. Authentication Flow', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@foodconnect.com',
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toMatchObject({
        email: 'test@foodconnect.com',
        username: 'testuser',
        name: 'Test User',
      });

      authToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'test@foodconnect.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe('test@foodconnect.com');
    });

    it('should fail login with invalid credentials', async () => {
      const loginDto = {
        email: 'test@foodconnect.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('2. Restaurant Management', () => {
    it('should create a new restaurant', async () => {
      const createRestaurantDto = {
        name: 'Test Pizza Place',
        description: 'Best pizza in town',
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '(555) 123-4567',
        email: 'info@testpizza.com',
        website: 'https://testpizza.com',
        category: 'Italian',
        cuisine: 'Pizza',
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minimumOrder: 15.0,
        isOpen: true,
      };

      const response = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRestaurantDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: 'Test Pizza Place',
        description: 'Best pizza in town',
        address: '123 Main St',
        city: 'Test City',
      });

      restaurantId = response.body.data.id;
    });

    it('should get all restaurants', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
    });

    it('should get restaurant by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/restaurants/${restaurantId}`)
        .expect(200);

      expect(response.body.data.id).toBe(restaurantId);
      expect(response.body.data.name).toBe('Test Pizza Place');
    });
  });

  describe('3. Menu Items Management', () => {
    it('should create a menu item', async () => {
      const createMenuItemDto = {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato, mozzarella, and basil',
        price: 18.99,
        category: 'pizza',
        imageUrl: 'https://example.com/margherita.jpg',
        isAvailable: true,
        restaurantId: restaurantId,
      };

      const response = await request(app.getHttpServer())
        .post('/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMenuItemDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Margherita Pizza',
        price: 18.99,
        category: 'pizza',
        restaurantId: restaurantId,
      });

      menuItemId = response.body.id;
    });

    it('should get menu items by restaurant', async () => {
      const response = await request(app.getHttpServer())
        .get(`/menu-items/restaurant/${restaurantId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].restaurantId).toBe(restaurantId);
    });

    it('should get all menu items', async () => {
      const response = await request(app.getHttpServer())
        .get('/menu-items')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('4. Order Management & Checkout', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        restaurantId: restaurantId,
        total: 21.98, // 18.99 + 2.99 delivery
        subtotal: 18.99,
        deliveryFee: 2.99,
        deliveryAddress: '456 Customer St, Test City, TS 12345',
        notes: 'Ring doorbell twice',
        orderItems: [
          {
            menuItemId: menuItemId,
            quantity: 1,
            price: 18.99,
            notes: 'Extra basil please',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toMatchObject({
        restaurantId: restaurantId,
        total: 21.98,
        subtotal: 18.99,
        deliveryFee: 2.99,
        status: 'pending',
      });

      expect(response.body.orderItems).toHaveLength(1);
      expect(response.body.orderItems[0]).toMatchObject({
        menuItemId: menuItemId,
        quantity: 1,
        price: 18.99,
      });

      orderId = response.body.id;
    });

    it('should get order by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body.total).toBe(21.98);
      expect(response.body.orderItems).toHaveLength(1);
    });

    it('should get orders by user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(orderId);
    });

    it('should update order status', async () => {
      const updateOrderDto = {
        status: 'confirmed',
        estimatedTime: '25-30 min',
        notes: 'Order confirmed, preparing now',
      };

      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateOrderDto)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
      expect(response.body.estimatedTime).toBe('25-30 min');
    });

    it('should get all orders (admin view)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('5. Complete Flow Integration', () => {
    it('should complete entire user journey: register → browse → order → track', async () => {
      // 1. Register new user
      const newUserDto = {
        email: 'customer@example.com',
        username: 'customer',
        name: 'Customer User',
        password: 'customer123',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserDto)
        .expect(201);

      const customerToken = registerResponse.body.access_token;

      // 2. Browse restaurants
      const restaurantsResponse = await request(app.getHttpServer())
        .get('/restaurants')
        .expect(200);

      expect(restaurantsResponse.body.length).toBeGreaterThan(0);

      // 3. View restaurant menu
      const menuResponse = await request(app.getHttpServer())
        .get(`/menu-items/restaurant/${restaurantId}`)
        .expect(200);

      expect(menuResponse.body.length).toBeGreaterThan(0);

      // 4. Place order
      const customerOrderDto = {
        restaurantId: restaurantId,
        total: 40.97, // 2 pizzas + delivery
        subtotal: 37.98,
        deliveryFee: 2.99,
        deliveryAddress: '789 Another St, Test City, TS 12345',
        notes: 'Leave at door',
        orderItems: [
          {
            menuItemId: menuItemId,
            quantity: 2,
            price: 18.99,
          },
        ],
      };

      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(customerOrderDto)
        .expect(201);

      expect(orderResponse.body.total).toBe(40.97);

      // 5. Track order
      const trackResponse = await request(app.getHttpServer())
        .get(`/orders/${orderResponse.body.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(trackResponse.body.id).toBe(orderResponse.body.id);
      expect(trackResponse.body.status).toBe('pending');
    });
  });

  describe('6. Error Handling', () => {
    it('should handle unauthorized access', async () => {
      await request(app.getHttpServer()).post('/orders').send({}).expect(401);
    });

    it('should validate required fields', async () => {
      const invalidOrderDto = {
        // Missing required fields
        total: 'invalid',
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderDto)
        .expect(400);
    });

    it('should handle non-existent resources', async () => {
      await request(app.getHttpServer())
        .get('/restaurants/non-existent-id')
        .expect(404);
    });
  });
});
