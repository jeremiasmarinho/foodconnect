#!/bin/bash
# Script para iniciar o projeto FoodConnect completo (backend + frontend)

set -e

echo "🚀 Iniciando FoodConnect..."
echo ""

# Encerrar processos anteriores
echo "🧹 Limpando processos anteriores..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
sleep 2

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backend
echo ""
echo "=== 🔧 Configurando Backend ==="
cd "$PROJECT_DIR/backend"

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

echo "🗄️  Verificando banco de dados..."
if [ ! -f "prisma/dev.db" ]; then
    echo "Criando banco de dados..."
    npx prisma migrate dev --name init
else
    echo "Banco de dados já existe"
fi

echo "▶️  Iniciando backend na porta 3000..."
npm run start:dev > "$PROJECT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Aguardar backend iniciar
echo "⏳ Aguardando backend inicializar..."
sleep 5

# Frontend
echo ""
echo "=== 🎨 Configurando Frontend ==="
cd "$PROJECT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

echo "▶️  Iniciando Expo Web na porta 8081..."
npx expo start --web > "$PROJECT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Salvar PIDs
echo "$BACKEND_PID" > "$PROJECT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_DIR/.frontend.pid"

# Mensagem final
sleep 3
echo ""
echo "✅ Projeto iniciado com sucesso!"
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:8081"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f $PROJECT_DIR/backend.log"
echo "   Frontend: tail -f $PROJECT_DIR/frontend.log"
echo ""
echo "🛑 Para parar os serviços:"
echo "   ./stop-all.sh"
echo "   ou: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 Abra http://localhost:8081 no navegador!"

