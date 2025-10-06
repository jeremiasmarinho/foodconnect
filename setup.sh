#!/bin/bash

# 🚀 FoodConnect - Script de Setup Automático
# Este script configura o ambiente de desenvolvimento do FoodConnect

echo "🚀 FoodConnect - Setup Automático"
echo "=================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js v18+ primeiro."
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Instale PostgreSQL v14+ primeiro."
    exit 1
fi

echo "✅ Pré-requisitos verificados"

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

# Configurar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️ Configurando arquivo .env..."
    cp .env.example .env
    echo "📝 Arquivo .env criado. Configure as variáveis antes de continuar."
fi

# Executar migrações do Prisma
echo "🗄️ Configurando banco de dados..."
npx prisma migrate dev --name init
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao configurar banco de dados"
    echo "💡 Certifique-se de que PostgreSQL está rodando e as credenciais estão corretas no .env"
    exit 1
fi

# Voltar para raiz e instalar dependências do frontend
cd ..
echo "📱 Instalando dependências do frontend..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo backend/.env com suas credenciais"
echo "2. Execute 'cd backend && npm run start:dev' para iniciar o backend"
echo "3. Execute 'cd frontend && npm run web' para iniciar o frontend"
echo "4. Acesse http://localhost:3000/seed/database para popular com dados de teste"
echo ""
echo "📚 Documentação: http://localhost:3000/api"
echo "❤️ Health Check: http://localhost:3000/health"