import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Seed the database with realistic restaurant and user data
   */
  async seedDatabase() {
    this.logger.log('Starting database seeding...');

    try {
      // Clear existing data (in development only)
      await this.clearDatabase();

      // Create users
      const users = await this.createUsers(20);
      this.logger.log(`Created ${users.length} users`);

      // Create restaurants
      const restaurants = await this.createRestaurants(50);
      this.logger.log(`Created ${restaurants.length} restaurants`);

      // Create posts
      const posts = await this.createPosts(users, restaurants, 300);
      this.logger.log(`Created ${posts.length} posts`);

      // Create likes and comments
      await this.createEngagement(users, posts);
      this.logger.log('Created likes and comments');

      this.logger.log('Database seeding completed successfully!');

      return {
        success: true,
        message: 'Database seeded successfully',
        data: {
          users: users.length,
          restaurants: restaurants.length,
          posts: posts.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to seed database', error);
      throw error;
    }
  }

  /**
   * Clear existing data (development only)
   */
  private async clearDatabase() {
    this.logger.log('Clearing existing data...');

    await this.prisma.comment.deleteMany();
    await this.prisma.like.deleteMany();
    await this.prisma.post.deleteMany();
    await this.prisma.restaurant.deleteMany();
    await this.prisma.user.deleteMany();
  }

  /**
   * Create realistic users
   */
  private async createUsers(count: number) {
    this.logger.log(`Creating ${count} users...`);

    const users: any[] = [];
    const usedUsernames = new Set();
    const usedEmails = new Set();

    for (let i = 0; i < count; i++) {
      let username = faker.internet.username().toLowerCase();
      let email = faker.internet.email().toLowerCase();

      // Ensure unique usernames and emails
      while (usedUsernames.has(username)) {
        username = faker.internet.username().toLowerCase();
      }
      while (usedEmails.has(email)) {
        email = faker.internet.email().toLowerCase();
      }

      usedUsernames.add(username);
      usedEmails.add(email);

      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          name: faker.person.fullName(),
          password:
            '$2b$10$8JxPZZYHflH1zfWPz7g7.uD0gLxYzN4w9Bz8yoJoGm5lVpP4zRqMm', // "password123"
          bio: faker.lorem.sentence(),
          avatar: faker.image.avatar(),
        },
      });

      users.push(user);
    }

    return users;
  }

  /**
   * Create realistic restaurants
   */
  private async createRestaurants(count: number) {
    this.logger.log(`Creating ${count} restaurants...`);

    const cuisineTypes = [
      'Brasileira',
      'Italiana',
      'Japonesa',
      'Chinesa',
      'Mexicana',
      'Indiana',
      'Francesa',
      'Americana',
      'Árabe',
      'Tailandesa',
      'Vegetariana',
      'Vegana',
      'Mediterrânea',
      'Coreana',
      'Peruana',
    ];

    const restaurants: any[] = [];

    for (let i = 0; i < count; i++) {
      const cuisine = faker.helpers.arrayElement(cuisineTypes);
      const name = this.generateRestaurantName(cuisine);

      const restaurant = await this.prisma.restaurant.create({
        data: {
          name,
          description: faker.lorem.sentences(2),
          cuisine,
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          latitude: faker.location.latitude({ min: -23.7, max: -23.4 }), // São Paulo region
          longitude: faker.location.longitude({ min: -46.8, max: -46.4 }),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          website: faker.internet.url(),
          rating: parseFloat(
            faker.number
              .float({ min: 3.0, max: 5.0, fractionDigits: 1 })
              .toFixed(1),
          ),
          zipCode: faker.location.zipCode(),

          // openingHours será implementado em versão futura
          isOpen: true,
        },
      });

      restaurants.push(restaurant);
    }

    return restaurants;
  }

  /**
   * Generate restaurant name based on cuisine
   */
  private generateRestaurantName(cuisine: string): string {
    const prefixes = {
      Brasileira: ['Casa', 'Cantina', 'Sabor', 'Tempero', 'Fogão'],
      Italiana: ['Bella', 'Casa', 'Nonna', 'Mamma', 'Osteria'],
      Japonesa: ['Sushi', 'Sakura', 'Yamato', 'Tokyo', 'Wasabi'],
      Chinesa: ['Dragon', 'Panda', 'Golden', 'China', 'Ming'],
      Mexicana: ['El', 'La', 'Casa', 'Cantina', 'Taco'],
    };

    const suffixes = {
      Brasileira: ['do Brasil', 'Mineiro', 'da Vovó', 'Caipira', 'Sertanejo'],
      Italiana: ['Italiana', 'di Roma', 'Milano', 'Toscana', 'Venezia'],
      Japonesa: ['Sushi Bar', 'Japanese', 'Restaurante', 'House', 'Express'],
      Chinesa: ['Chinese', 'Wok', 'Palace', 'Garden', 'House'],
      Mexicana: ['Mexicano', 'Cantina', 'Grill', 'Tacos', 'Azteca'],
    };

    const prefix = faker.helpers.arrayElement(
      prefixes[cuisine] || ['Restaurant'],
    );
    const suffix = faker.helpers.arrayElement(suffixes[cuisine] || ['']);
    const name = faker.person.lastName();

    return `${prefix} ${name} ${suffix}`.trim();
  }

  /**
   * Generate realistic opening hours
   */
  private generateOpeningHours(): any {
    return {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:00', closed: false },
      sunday: {
        open: '11:00',
        close: '22:00',
        closed: faker.datatype.boolean({ probability: 0.3 }),
      },
    };
  }

  /**
   * Create realistic posts
   */
  private async createPosts(users: any[], restaurants: any[], count: number) {
    this.logger.log(`Creating ${count} posts...`);

    const foodDescriptions = [
      'Delicioso prato que experimentei hoje! Super recomendo.',
      'Comida incrível, ambiente acolhedor. Voltarei em breve!',
      'Melhor experiência gastronômica da semana. Imperdível!',
      'Sabores autênticos e apresentação perfeita.',
      'Atendimento excepcional e comida de qualidade.',
      'Descobri um novo favorito na cidade!',
      'Experiência única, vale cada centavo.',
      'Comida caseira com toque especial.',
      'Ambiente perfeito para um almoço em família.',
      'Ingredientes frescos fazem toda a diferença.',
    ];

    const foodTags = [
      ['delicious', 'yummy', 'tasty'],
      ['authentic', 'traditional', 'homemade'],
      ['fresh', 'organic', 'healthy'],
      ['spicy', 'flavorful', 'bold'],
      ['comfort food', 'hearty', 'satisfying'],
      ['gourmet', 'fine dining', 'elegant'],
      ['casual', 'friendly', 'cozy'],
      ['innovative', 'creative', 'unique'],
      ['value', 'affordable', 'budget-friendly'],
      ['romantic', 'date night', 'special occasion'],
    ];

    const posts: any[] = [];

    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      const restaurant = faker.helpers.arrayElement(restaurants);
      const description = faker.helpers.arrayElement(foodDescriptions);

      // Create post with random date in the last 30 days
      const createdAt = faker.date.recent({ days: 30 });

      const post = await this.prisma.post.create({
        data: {
          content: description,
          userId: user.id,
          restaurantId: restaurant.id,
          rating: faker.datatype.boolean({ probability: 0.8 })
            ? faker.number.int({ min: 3, max: 5 })
            : null,
          imageUrl: faker.datatype.boolean({ probability: 0.9 })
            ? faker.image.urlLoremFlickr({
                category: 'food',
                width: 800,
                height: 600,
              })
            : null,
          createdAt,
          updatedAt: createdAt,
        },
      });

      posts.push(post);
    }

    return posts;
  }

  /**
   * Create likes and comments for engagement
   */
  private async createEngagement(users: any[], posts: any[]) {
    this.logger.log('Creating engagement (likes and comments)...');

    // Create likes
    const likesPromises: any[] = [];
    for (const post of posts) {
      const likeCount = faker.number.int({ min: 0, max: 15 });
      const likedUsers = faker.helpers.arrayElements(users, likeCount);

      for (const user of likedUsers) {
        likesPromises.push(
          this.prisma.like
            .create({
              data: {
                userId: user.id,
                postId: post.id,
              },
            })
            .catch(() => {}), // Ignore duplicate likes
        );
      }
    }

    await Promise.all(likesPromises);

    // Create comments
    const commentTexts = [
      'Que delícia! 😋',
      'Preciso ir nesse lugar!',
      'Looks amazing!',
      'Recomendo muito!',
      'Já estou com água na boca',
      'Perfeito! 👌',
      'Onde fica esse restaurante?',
      'Vou levar minha família lá',
      'Experiência incrível!',
      'Que apresentação linda!',
    ];

    const commentsPromises: any[] = [];
    for (const post of posts) {
      const commentCount = faker.number.int({ min: 0, max: 5 });

      for (let i = 0; i < commentCount; i++) {
        const user = faker.helpers.arrayElement(users);
        const content = faker.helpers.arrayElement(commentTexts);

        commentsPromises.push(
          this.prisma.comment.create({
            data: {
              content,
              userId: user.id,
              postId: post.id,
              createdAt: faker.date.between({
                from: post.createdAt,
                to: new Date(),
              }),
            },
          }),
        );
      }
    }

    await Promise.all(commentsPromises);
  }
}
