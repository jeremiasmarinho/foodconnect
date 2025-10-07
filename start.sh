#!/bin/bash

# FoodConnect - Script de Inicialização
# =======================================

set -e  # Exit on error

echo "🍔 FoodConnect - Iniciando Aplicação"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18.x ou 20.x${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION encontrado${NC}"
echo ""

# Verificar npm
echo "🔍 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm $NPM_VERSION encontrado${NC}"
echo ""

# Verificar se as portas estão livres
echo "🔍 Verificando portas..."
if check_port 3001; then
    echo -e "${YELLOW}⚠️  Porta 3001 (Backend) já está em uso${NC}"
    echo "   Execute: npx kill-port 3001"
    read -p "Deseja matar o processo? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npx kill-port 3001
        echo -e "${GREEN}✅ Porta 3001 liberada${NC}"
    else
        exit 1
    fi
fi

if check_port 8081; then
    echo -e "${YELLOW}⚠️  Porta 8081 (Frontend) já está em uso${NC}"
    echo "   Execute: npx kill-port 8081"
    read -p "Deseja matar o processo? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npx kill-port 8081
        echo -e "${GREEN}✅ Porta 8081 liberada${NC}"
    else
        exit 1
    fi
fi
echo -e "${GREEN}✅ Portas 3001 e 8081 disponíveis${NC}"
echo ""

# Verificar se node_modules existem
echo "🔍 Verificando dependências..."

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do backend não encontradas${NC}"
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
    echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do frontend não encontradas${NC}"
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"
fi
echo ""

# Verificar Prisma Client
echo "🔍 Verificando Prisma Client..."
if [ ! -d "backend/node_modules/.prisma" ]; then
    echo -e "${YELLOW}⚠️  Prisma Client não gerado${NC}"
    echo "🔧 Gerando Prisma Client..."
    cd backend && npx prisma generate && cd ..
    echo -e "${GREEN}✅ Prisma Client gerado${NC}"
fi
echo ""

# Verificar banco de dados
echo "🔍 Verificando banco de dados..."
if [ ! -f "backend/prisma/dev.db" ]; then
    echo -e "${YELLOW}⚠️  Banco de dados não encontrado${NC}"
    echo "🗄️  Criando banco de dados..."
    cd backend && npx prisma migrate dev && cd ..
    echo -e "${GREEN}✅ Banco de dados criado${NC}"
    
    echo "👤 Criando usuário admin..."
    cd backend && npm run db:seed && cd ..
    echo -e "${GREEN}✅ Usuário admin criado${NC}"
    echo ""
    echo -e "${GREEN}📧 Email: admin@foodconnect.com${NC}"
    echo -e "${GREEN}🔑 Senha: FoodConnect2024!${NC}"
fi
echo ""

# Menu de opções
echo "🚀 Como deseja iniciar?"
echo "======================="
echo "1. Ambos (Backend + Frontend) - Recomendado"
echo "2. Apenas Backend"
echo "3. Apenas Frontend"
echo "4. Rodar testes"
echo "5. Abrir Swagger"
echo "6. Sair"
echo ""
read -p "Escolha uma opção (1-6): " option

case $option in
    1)
        echo ""
        echo -e "${GREEN}🚀 Iniciando Backend e Frontend...${NC}"
        echo ""
        echo -e "${YELLOW}📝 Instruções:${NC}"
        echo "   - Backend: http://localhost:3001"
        echo "   - Frontend: http://localhost:8081"
        echo "   - Swagger: http://localhost:3001/api"
        echo "   - Pressione Ctrl+C para parar"
        echo ""
        
        # Criar arquivo temporário para capturar PIDs
        BACKEND_PID_FILE="/tmp/foodconnect_backend.pid"
        FRONTEND_PID_FILE="/tmp/foodconnect_frontend.pid"
        
        # Função de limpeza ao sair
        cleanup() {
            echo ""
            echo "🛑 Parando serviços..."
            if [ -f "$BACKEND_PID_FILE" ]; then
                BACKEND_PID=$(cat "$BACKEND_PID_FILE")
                kill $BACKEND_PID 2>/dev/null || true
                rm "$BACKEND_PID_FILE"
            fi
            if [ -f "$FRONTEND_PID_FILE" ]; then
                FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
                kill $FRONTEND_PID 2>/dev/null || true
                rm "$FRONTEND_PID_FILE"
            fi
            echo "✅ Serviços parados"
            exit 0
        }
        
        trap cleanup SIGINT SIGTERM
        
        # Salvar diretório atual
        ROOT_DIR=$(pwd)
        
        # Iniciar backend em background
        cd "$ROOT_DIR/backend" && npm run start:dev > "$ROOT_DIR/backend.log" 2>&1 &
        echo $! > "$BACKEND_PID_FILE"
        
        echo "⏳ Aguardando backend iniciar..."
        sleep 3
        
        # Iniciar frontend em background
        cd "$ROOT_DIR/frontend" && npm run web > "$ROOT_DIR/frontend.log" 2>&1 &
        echo $! > "$FRONTEND_PID_FILE"
        cd "$ROOT_DIR"
        
        echo ""
        echo -e "${GREEN}✅ Serviços iniciados!${NC}"
        echo ""
        echo "📊 Logs em tempo real:"
        echo "   - Backend: tail -f backend.log"
        echo "   - Frontend: tail -f frontend.log"
        echo ""
        echo "Pressione Ctrl+C para parar os serviços..."
        
        # Manter script rodando
        wait
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}🚀 Iniciando apenas Backend...${NC}"
        cd backend && npm run start:dev
        ;;
        
    3)
        echo ""
        echo -e "${GREEN}🚀 Iniciando apenas Frontend...${NC}"
        cd frontend && npm run web
        ;;
        
    4)
        echo ""
        echo "🧪 Qual teste deseja rodar?"
        echo "1. Backend - Testes unitários"
        echo "2. Backend - Testes E2E"
        echo "3. Frontend - Testes"
        echo "4. Todos os testes"
        read -p "Escolha (1-4): " test_option
        
        case $test_option in
            1)
                cd backend && npm test
                ;;
            2)
                cd backend && npm run test:e2e
                ;;
            3)
                cd frontend && npm test
                ;;
            4)
                echo "Rodando testes do backend..."
                cd backend && npm run test:all:cov
                echo ""
                echo "Rodando testes do frontend..."
                cd ../frontend && npm run test:coverage
                ;;
        esac
        ;;
        
    5)
        echo ""
        echo -e "${GREEN}📚 Abrindo Swagger...${NC}"
        echo "Aguarde o backend iniciar..."
        cd backend && npm run start:dev &
        BACKEND_PID=$!
        sleep 5
        
        # Tentar abrir no navegador
        if command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:3001/api"
        elif command -v open &> /dev/null; then
            open "http://localhost:3001/api"
        else
            echo "Acesse: http://localhost:3001/api"
        fi
        
        echo "Pressione Ctrl+C para parar o backend..."
        wait $BACKEND_PID
        ;;
        
    6)
        echo "👋 Até logo!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac
