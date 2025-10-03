import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Criando usuário administrador...');

    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@foodconnect.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nome:', existingAdmin.name);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcryptjs.hash('FoodConnect2024!', 10);

    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@foodconnect.com',
        password: hashedPassword,
        name: 'Administrator',
        username: 'admin',
        bio: 'Administrador do sistema FoodConnect',
      },
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nome:', adminUser.name);
    console.log('🆔 ID:', adminUser.id);
    console.log('🔑 Senha: FoodConnect2024!');

    // Criar usuários de teste adicionais
    await createTestUsers();
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createTestUsers() {
  console.log('👥 Criando usuários de teste...');

  const testUsers = [
    {
      email: 'user@foodconnect.com',
      password: 'User123!',
      name: 'Usuário Teste',
      username: 'user-test',
      bio: 'Usuário de teste do sistema',
    },
    {
      email: 'restaurant@foodconnect.com',
      password: 'Restaurant123!',
      name: 'Restaurante Teste',
      username: 'restaurant-test',
      bio: 'Conta de restaurante para testes',
    },
  ];

  for (const userData of testUsers) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcryptjs.hash(userData.password, 10);

        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
        });

        console.log(`✅ Usuário criado: ${user.email}`);
      } else {
        console.log(`⚠️  Usuário já existe: ${userData.email}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${userData.email}:`, error);
    }
  }
}

// Executar o script
createAdminUser();
