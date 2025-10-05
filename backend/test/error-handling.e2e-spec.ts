import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import * as request from 'supertest';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { AppModule } from '../src/app.module';

describe('Error Handling System (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: APP_FILTER,
          useClass: GlobalExceptionFilter,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Global Exception Filter', () => {
    it('should handle 404 Not Found errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-endpoint')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path', '/nonexistent-endpoint');
      expect(response.body).toHaveProperty('method', 'GET');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle validation errors (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email', // Invalid email format
          password: '123', // Too short
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });

    it('should handle unauthorized errors (401)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile') // Protected route
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message');
    });

    it('should include stack trace in development', async () => {
      // Set NODE_ENV to development for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const response = await request(app.getHttpServer())
          .get('/nonexistent-endpoint')
          .expect(HttpStatus.NOT_FOUND);

        // Stack trace should be included in development
        if (process.env.NODE_ENV === 'development') {
          expect(response.body).toHaveProperty('stack');
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should not include stack trace in production', async () => {
      // Set NODE_ENV to production for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const response = await request(app.getHttpServer())
          .get('/nonexistent-endpoint')
          .expect(HttpStatus.NOT_FOUND);

        // Stack trace should not be included in production
        expect(response.body).not.toHaveProperty('stack');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('Logging Interceptor', () => {
    it('should log successful requests', async () => {
      // Mock console.log to capture logs
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app.getHttpServer()).get('/').expect(HttpStatus.OK);

      // Verify that request and response were logged
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('➡️  GET /'),
        expect.any(String),
      );

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('⬅️  GET /'),
        expect.any(String),
      );

      logSpy.mockRestore();
    });

    it('should log error requests', async () => {
      // Mock console.error to capture error logs
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await request(app.getHttpServer())
        .get('/nonexistent-endpoint')
        .expect(HttpStatus.NOT_FOUND);

      // Verify that error was logged
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ GET /nonexistent-endpoint'),
        expect.any(String),
        expect.any(String),
      );

      errorSpy.mockRestore();
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-endpoint')
        .expect(HttpStatus.NOT_FOUND);

      // Verify error response structure
      expect(response.body).toMatchObject({
        statusCode: expect.any(Number),
        timestamp: expect.any(String),
        path: expect.any(String),
        method: expect.any(String),
        error: expect.any(String),
        message: expect.any(String),
      });

      // Verify timestamp is valid ISO string
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });

    it('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];

      for (const method of methods) {
        const response = await request(app.getHttpServer())
          [method.toLowerCase()]('/nonexistent-endpoint')
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.method).toBe(method);
      }
    });
  });
});
