import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstablishmentType } from '@prisma/client';

@Injectable()
export class RestaurantsSeedService {
  private readonly logger = new Logger(RestaurantsSeedService.name);

  constructor(private prisma: PrismaService) {}

  async seedRestaurants() {
    this.logger.log('Starting restaurant seeding...');

    const mockRestaurants = [
      {
        name: 'Pizza Prime',
        type: EstablishmentType.RESTAURANT,
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
        type: EstablishmentType.RESTAURANT,
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
        type: EstablishmentType.RESTAURANT,
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
        type: EstablishmentType.RESTAURANT,
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
        name: 'Doce Vida',
        type: EstablishmentType.RESTAURANT,
        description:
          'Sobremesas irresistíveis, bolos artesanais e doces gourmet para adoçar seu dia.',
        address: 'Rua dos Jardins, 654',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01402-000',
        phone: '(11) 99999-5678',
        email: 'vendas@docevida.com.br',
        category: 'dessert',
        cuisine: 'Confeitaria',
        rating: 4.5,
        deliveryTime: '20-30 min',
        deliveryFee: 5.0,
        minimumOrder: 20.0,
        isOpen: false,
        imageUrl:
          'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        latitude: -23.5693,
        longitude: -46.6731,
      },
      {
        name: 'Green Bowl',
        type: EstablishmentType.RESTAURANT,
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
      {
        name: 'Cantina da Nonna',
        type: EstablishmentType.RESTAURANT,
        description:
          'Comida brasileira caseira como a da vovó, com tempero especial e muito carinho.',
        address: 'Rua da Mooca, 147',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03101-000',
        phone: '(11) 99999-7890',
        email: 'cantina@nonna.com.br',
        category: 'brazilian',
        cuisine: 'Brasileira',
        rating: 4.3,
        deliveryTime: '35-45 min',
        deliveryFee: 7.0,
        minimumOrder: 35.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1559847844-d023b4d56d17?w=400',
        latitude: -23.5507,
        longitude: -46.6001,
      },
      {
        name: 'Pizza Express',
        type: EstablishmentType.RESTAURANT,
        description:
          'Pizzas rápidas e saborosas para quando a fome bate e você não pode esperar.',
        address: 'Rua do Comércio, 258',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01013-000',
        phone: '(11) 99999-8901',
        email: 'pedidos@pizzaexpress.com.br',
        category: 'pizza',
        cuisine: 'Italiana',
        rating: 4.2,
        deliveryTime: '20-30 min',
        deliveryFee: 3.99,
        minimumOrder: 22.0,
        isOpen: true,
        imageUrl:
          'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400',
        latitude: -23.5448,
        longitude: -46.6388,
      },
    ];

    try {
      // Check if restaurants already exist
      const existingCount = await this.prisma.establishment.count();
      if (existingCount > 0) {
        this.logger.log(
          `Found ${existingCount} existing restaurants. Skipping seeding.`,
        );
        return;
      }

      // Create restaurants
      this.logger.log(`Creating ${mockRestaurants.length} restaurants...`);
      const createdRestaurants = await this.prisma.establishment.createMany({
        data: mockRestaurants,
      });

      this.logger.log(
        `Successfully created ${createdRestaurants.count} restaurants!`,
      );
    } catch (error) {
      this.logger.error('Error seeding restaurants:', error);
      throw error;
    }
  }
}
