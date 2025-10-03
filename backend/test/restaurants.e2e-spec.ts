import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Restaurants API (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/restaurants (GET)', () => {
    it('should return list of restaurants', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination).toHaveProperty('page', 1);
    });
  });

  describe('/restaurants/:id (GET)', () => {
    it('should return a single restaurant', async () => {
      // First, get a restaurant ID from the list
      const listResponse = await request(app.getHttpServer())
        .get('/restaurants')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const restaurantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${restaurantId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id', restaurantId);
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('description');
      }
    });

    it('should return 404 for non-existent restaurant', async () => {
      await request(app.getHttpServer())
        .get('/restaurants/non-existent-id')
        .expect(404);
    });
  });

  describe('/restaurants/search/query (GET)', () => {
    it('should search restaurants by query', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants/search/query?q=pizza')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return error for empty query', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants/search/query?q=')
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Search query is required');
    });
  });

  describe('/restaurants/nearby/location (GET)', () => {
    it('should find nearby restaurants', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants/nearby/location?lat=-23.5505&lng=-46.6333&radius=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return error for missing coordinates', async () => {
      const response = await request(app.getHttpServer())
        .get('/restaurants/nearby/location')
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain(
        'Latitude and longitude are required',
      );
    });
  });

  describe('/restaurants/seed (POST)', () => {
    it('should seed restaurants with mock data', async () => {
      const response = await request(app.getHttpServer())
        .post('/restaurants/seed')
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Successfully seeded');
    });
  });
});
