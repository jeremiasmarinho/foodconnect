import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenuItems() {
  console.log('🌱 Seeding menu items...');

  const establishments = await prisma.establishment.findMany({
    select: { id: true, name: true, type: true },
  });

  if (establishments.length === 0) {
    console.log('No establishments found. Please seed establishments first.');
    return;
  }

  const pizzaPalace = establishments.find((r) => r.name.includes('Pizza'));
  const burgerHouse = establishments.find((r) => r.name.includes('Burger'));

  if (!pizzaPalace) {
    console.log('Pizza Palace not found. Skipping pizza menu items.');
    return;
  }

  // Seed Pizza Palace menu items
  const pizzaMenuItems = [
    {
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela fresca, manjericão e azeite',
      price: 32.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1604382354936-07c5b6d3b50f?w=400',
      isAvailable: true,
      establishmentId: pizzaPalace.id,
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni artesanal',
      price: 38.9,
      category: 'main',
      imageUrl:
        'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
      isAvailable: true,
      establishmentId: pizzaPalace.id,
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
      establishmentId: pizzaPalace.id,
    },
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante gelado',
      price: 5.9,
      category: 'beverage',
      isAvailable: true,
      establishmentId: pizzaPalace.id,
    },
    {
      name: 'Tiramisu',
      description: 'Sobremesa italiana com café e mascarpone',
      price: 18.9,
      category: 'dessert',
      imageUrl:
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      isAvailable: true,
      establishmentId: pizzaPalace.id,
    },
  ];

  // Create pizza menu items
  for (const item of pizzaMenuItems) {
    await prisma.menuItem.create({
      data: item,
    });
  }

  console.log(`Created ${pizzaMenuItems.length} menu items for Pizza Palace`);

  // Seed Burger House menu items if it exists
  if (burgerHouse) {
    const burgerMenuItems = [
      {
        name: 'Classic Burger',
        description: 'Hambúrguer artesanal com queijo, alface e tomate',
        price: 28.9,
        category: 'main',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        establishmentId: burgerHouse.id,
      },
      {
        name: 'Bacon Burger',
        description: 'Hambúrguer com bacon crocante e queijo cheddar',
        price: 32.9,
        category: 'main',
        imageUrl:
          'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400',
        isAvailable: true,
        establishmentId: burgerHouse.id,
      },
      {
        name: 'Batata Frita',
        description: 'Batatas fritas crocantes',
        price: 12.9,
        category: 'appetizer',
        imageUrl:
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        isAvailable: true,
        establishmentId: burgerHouse.id,
      },
      {
        name: 'Milkshake de Chocolate',
        description: 'Milkshake cremoso de chocolate',
        price: 15.9,
        category: 'beverage',
        imageUrl:
          'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400',
        isAvailable: true,
        establishmentId: burgerHouse.id,
      },
    ];

    // Create burger menu items
    for (const item of burgerMenuItems) {
      await prisma.menuItem.create({
        data: item,
      });
    }

    console.log(
      `Created ${burgerMenuItems.length} menu items for Burger House`,
    );
  }

  console.log('✅ Menu items seeded successfully!');
}

async function main() {
  try {
    await seedMenuItems();
  } catch (error) {
    console.error('Error seeding menu items:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
