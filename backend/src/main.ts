import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend development
  app.enableCors({
    origin: [
      'http://localhost:8081', // Expo web
      'http://localhost:19006', // Expo alternative port
      'exp://localhost:8081', // Expo development
      'exp://192.168.0.110:8081', // Expo network access
      'exp://192.168.0.110:8082', // Expo alternative port
      'http://192.168.0.110:8081', // Expo HTTP
      'http://192.168.0.110:19000', // Expo DevTools
      'http://192.168.0.110:19006', // Expo alternative
      '*', // Allow all origins for development (remove in production)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('FoodConnect API')
    .setDescription(
      'API documentation for FoodConnect - Social Food Discovery Platform',
    )
    .setVersion('1.0')
    .addTag('app', 'Application health check')
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User management and profiles')
    .addTag('restaurants', 'Restaurant management and discovery')
    .addTag('posts', 'Social posts and interactions')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📱 Mobile access: http://192.168.0.110:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
void bootstrap();
