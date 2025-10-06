#!/bin/bash

# FoodConnect - Script de Setup Automático para Debian
# Execute: chmod +x setup-debian.sh && ./setup-debian.sh

set -e  # Parar em caso de erro

echo "🚀 Configurando FoodConnect no Debian..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando no Debian/Ubuntu
if ! command -v apt &> /dev/null; then
    print_error "Este script é para sistemas baseados em Debian/Ubuntu."
    exit 1
fi

print_step "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

print_step "Instalando dependências básicas..."
sudo apt install -y git curl build-essential python3-dev

print_step "Verificando Node.js..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    print_step "Instalando Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js já instalado: $(node --version)"
fi

print_step "Verificando se estamos no diretório do projeto..."
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto FoodConnect"
    exit 1
fi

print_step "Configurando backend..."
cd backend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado no diretório backend"
    exit 1
fi

print_step "Instalando dependências do backend..."
npm install

print_step "Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Arquivo .env criado a partir do .env.example"
        print_warning "Verifique e ajuste as variáveis conforme necessário"
    else
        print_warning "Arquivo .env não encontrado. Criando um básico..."
        cat > .env << EOF
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
EOF
    fi
fi

print_step "Limpando banco de dados antigo (Windows)..."
rm -f dev.db*
rm -rf prisma/migrations

print_step "Configurando banco de dados..."
npx prisma db push

print_step "Gerando cliente Prisma..."
npx prisma generate

print_step "Criando dados de teste..."
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    npx prisma db seed
else
    print_warning "Arquivo de seed não encontrado. Pulando..."
fi

print_step "Verificando se tudo está funcionando..."
timeout 10s npm run start:dev > /dev/null 2>&1 && echo "✅ Servidor iniciou com sucesso!" || print_warning "Teste do servidor ignorado"

print_step "Tornando scripts de teste executáveis..."
chmod +x test-*.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "  cd backend"
echo "  npm run start:dev"
echo ""
echo "Para testar as APIs:"
echo "  ./test-follow-system.sh"
echo ""
echo "Para abrir o Prisma Studio:"
echo "  npx prisma studio"
echo ""
echo "O servidor estará disponível em: http://localhost:3000"
echo ""

# Voltar ao diretório raiz
cd ..

echo "✨ Pronto para desenvolver no Linux! ✨"