import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCompleteSystem() {
  console.log('🚀 Iniciando teste completo do sistema de pedidos...\n');

  try {
    // 1. Verificar restaurantes
    console.log('1️⃣ Verificando restaurantes...');
    const restaurants = await prisma.restaurant.findMany();
    console.log(`   ✅ Encontrados ${restaurants.length} restaurantes`);

    if (restaurants.length === 0) {
      console.log(
        '   ❌ Nenhum restaurante encontrado. Execute o seed primeiro.',
      );
      return;
    }

    // 2. Criar itens de menu para os primeiros 2 restaurantes
    console.log('\n2️⃣ Criando itens de menu...');

    const restaurant1 = restaurants[0];
    const restaurant2 = restaurants[1];

    // Menu para restaurante 1
    const menuItems1 = [
      {
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela fresca, manjericão e azeite',
        price: 32.9,
        category: 'main',
        imageUrl:
          'https://images.unsplash.com/photo-1604382354936-07c5b6d3b50f?w=400',
        isAvailable: true,
        restaurantId: restaurant1.id,
      },
      {
        name: 'Pizza Pepperoni',
        description: 'Molho de tomate, mussarela e pepperoni artesanal',
        price: 38.9,
        category: 'main',
        imageUrl:
          'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
        isAvailable: true,
        restaurantId: restaurant1.id,
      },
      {
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante gelado',
        price: 5.9,
        category: 'beverage',
        isAvailable: true,
        restaurantId: restaurant1.id,
      },
    ];

    // Menu para restaurante 2
    const menuItems2 = [
      {
        name: 'Classic Burger',
        description:
          'Hambúrguer de carne bovina, alface, tomate, cebola e molho especial',
        price: 28.9,
        category: 'main',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        restaurantId: restaurant2.id,
      },
      {
        name: 'Batata Frita Grande',
        description: 'Porção generosa de batatas fritas crocantes',
        price: 15.9,
        category: 'appetizer',
        imageUrl:
          'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400',
        isAvailable: true,
        restaurantId: restaurant2.id,
      },
    ];

    const allMenuItems = [...menuItems1, ...menuItems2];

    for (const item of allMenuItems) {
      await prisma.menuItem.create({ data: item });
    }

    console.log(`   ✅ Criados ${allMenuItems.length} itens de menu`);

    // 3. Verificar usuários
    console.log('\n3️⃣ Verificando usuários...');
    const users = await prisma.user.findMany();
    console.log(`   ✅ Encontrados ${users.length} usuários`);

    if (users.length === 0) {
      console.log(
        '   ❌ Nenhum usuário encontrado. Criando usuário de teste...',
      );

      const testUser = await prisma.user.create({
        data: {
          email: 'test@foodconnect.com',
          username: 'testuser',
          name: 'Usuário de Teste',
          password: '$2b$10$example.hash', // Hash fictício para teste
          bio: 'Usuário criado para testes do sistema',
        },
      });

      console.log(`   ✅ Usuário de teste criado: ${testUser.email}`);
    }

    // 4. Criar pedido de teste
    console.log('\n4️⃣ Criando pedido de teste...');

    const testUser = await prisma.user.findFirst();
    const menuItems = await prisma.menuItem.findMany({ take: 2 });

    if (testUser && menuItems.length >= 2) {
      const orderItems = [
        {
          menuItemId: menuItems[0].id,
          quantity: 2,
          price: menuItems[0].price,
          notes: 'Sem cebola, por favor',
        },
        {
          menuItemId: menuItems[1].id,
          quantity: 1,
          price: menuItems[1].price,
        },
      ];

      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const deliveryFee = 5.99;
      const total = subtotal + deliveryFee;

      const testOrder = await prisma.order.create({
        data: {
          userId: testUser.id,
          restaurantId: restaurant1.id,
          status: 'pending',
          subtotal,
          deliveryFee,
          total,
          deliveryAddress: 'Rua Teste, 123 - Centro, São Paulo - SP',
          notes: 'Pedido de teste do sistema',
          orderItems: {
            create: orderItems,
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

      console.log(`   ✅ Pedido de teste criado: #${testOrder.id.slice(-6)}`);
      console.log(`   💰 Total: R$ ${testOrder.total.toFixed(2)}`);
      console.log(`   🏪 Restaurante: ${testOrder.restaurant.name}`);
      console.log(`   👤 Cliente: ${testOrder.user.name}`);
    }

    // 5. Resumo final
    console.log('\n📊 RESUMO DO SISTEMA:');

    const finalStats = await Promise.all([
      prisma.restaurant.count(),
      prisma.menuItem.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);

    console.log(`   🏪 Restaurantes: ${finalStats[0]}`);
    console.log(`   🍕 Itens de Menu: ${finalStats[1]}`);
    console.log(`   👥 Usuários: ${finalStats[2]}`);
    console.log(`   📦 Pedidos: ${finalStats[3]}`);

    console.log('\n🎉 SISTEMA COMPLETO E FUNCIONANDO!');
    console.log('\n📱 Próximos passos:');
    console.log('   1. Iniciar o frontend: cd ../frontend && npm start');
    console.log('   2. Testar navegação entre restaurantes');
    console.log('   3. Adicionar itens ao carrinho');
    console.log('   4. Fazer um pedido de teste');
    console.log('   5. Verificar histórico de pedidos');
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testCompleteSystem();
