import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenuItems() {
  // Seed data for Pizza Palace
  const pizzaPalaceMenuItems = [
    {
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela fresca, manjericão e azeite',
      price: 32.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1604382354936-07c5b6d3b50f?w=400',
      isAvailable: true,
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni artesanal',
      price: 38.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
      isAvailable: true,
    },
    {
      name: 'Pizza Quattro Stagioni',
      description:
        'Molho de tomate, mussarela, presunto, cogumelos, alcachofras e azeitonas',
      price: 45.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      isAvailable: true,
    },
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante gelado',
      price: 5.9,
      category: 'beverage',
      isAvailable: true,
    },
    {
      name: 'Tiramisu',
      description: 'Sobremesa italiana com café e mascarpone',
      price: 18.9,
      category: 'dessert',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      isAvailable: true,
    },
  ];

  // Seed data for Burger House
  const burgerHouseMenuItems = [
    {
      name: 'Classic Burger',
      description:
        'Hambúrguer de carne bovina, alface, tomate, cebola e molho especial',
      price: 28.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      isAvailable: true,
    },
    {
      name: 'Bacon Cheeseburger',
      description: 'Hambúrguer com queijo cheddar e bacon crocante',
      price: 34.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400',
      isAvailable: true,
    },
    {
      name: 'Batata Frita Grande',
      description: 'Porção generosa de batatas fritas crocantes',
      price: 15.9,
      category: 'appetizer',
      imageUrl:
        'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400',
      isAvailable: true,
    },
    {
      name: 'Milkshake de Chocolate',
      description: 'Cremoso milkshake de chocolate belga',
      price: 12.9,
      category: 'beverage',
      imageUrl:
        'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
      isAvailable: true,
    },
  ];

  // Get restaurant IDs
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true },
  });

  const pizzaPalace = restaurants.find((r) => r.name.includes('Pizza'));
  const burgerHouse = restaurants.find((r) => r.name.includes('Burger'));

  if (pizzaPalace) {
    for (const item of pizzaPalaceMenuItems) {
      await prisma.menuItem.create({
        data: {
          ...item,
          restaurantId: pizzaPalace.id,
        },
      });
    }
    console.log(
      `Created ${pizzaPalaceMenuItems.length} menu items for Pizza Palace`,
    );
  }

  if (burgerHouse) {
    for (const item of burgerHouseMenuItems) {
      await prisma.menuItem.create({
        data: {
          ...item,
          restaurantId: burgerHouse.id,
        },
      });
    }
    console.log(
      `Created ${burgerHouseMenuItems.length} menu items for Burger House`,
    );
  }
}

async function main() {
  try {
    await seedMenuItems();
    console.log('Menu items seeded successfully!');
  } catch (error) {
    console.error('Error seeding menu items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
