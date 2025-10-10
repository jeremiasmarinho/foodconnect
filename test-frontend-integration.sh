#!/bin/bash

# Script de Teste - Frontend Navigation Integration
# Data: 10 de Outubro de 2025

echo "🚀 FoodConnect - Frontend Integration Test"
echo "==========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se o backend está rodando
echo -e "${BLUE}📡 Verificando Backend...${NC}"
if pgrep -f "nest start" > /dev/null; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
    BACKEND_PID=$(pgrep -f "dist/src/main" | head -1)
    echo "   PID: $BACKEND_PID"
else
    echo -e "${RED}❌ Backend não está rodando${NC}"
    echo -e "${YELLOW}   Iniciando backend...${NC}"
    cd backend
    npm run start:dev > ../backend-test.log 2>&1 &
    echo -e "${GREEN}   Backend iniciado em background${NC}"
    cd ..
    sleep 5
fi

echo ""

# Verificar porta do backend
echo -e "${BLUE}🔌 Verificando porta 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondendo na porta 3000${NC}"
else
    echo -e "${RED}❌ Porta 3000 não está aberta${NC}"
fi

echo ""

# Testar endpoint de health do backend
echo -e "${BLUE}🏥 Testando Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ] || [ "$HEALTH_RESPONSE" = "404" ]; then
    echo -e "${GREEN}✅ Backend acessível (HTTP $HEALTH_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend pode não estar totalmente pronto (HTTP $HEALTH_RESPONSE)${NC}"
fi

echo ""

# Verificar estrutura de arquivos do frontend
echo -e "${BLUE}📁 Verificando arquivos da integração...${NC}"

FILES=(
    "frontend/src/components/AppHeader.tsx"
    "frontend/src/navigation/RootNavigator.tsx"
    "frontend/src/screens/main/NotificationsScreen.tsx"
    "frontend/src/screens/main/SearchScreen.tsx"
    "frontend/src/screens/main/AchievementsScreen.tsx"
    "frontend/src/screens/main/FeedScreen.tsx"
    "frontend/src/screens/main/ProfileScreen.tsx"
    "FRONTEND-NAVIGATION-INTEGRATION.md"
)

ALL_FILES_OK=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (não encontrado)${NC}"
        ALL_FILES_OK=false
    fi
done

echo ""

# Verificar erros TypeScript
echo -e "${BLUE}🔍 Verificando erros TypeScript no frontend...${NC}"
cd frontend
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ Encontrados erros TypeScript:${NC}"
    npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | head -5
else
    echo -e "${GREEN}✅ Nenhum erro TypeScript crítico${NC}"
fi
cd ..

echo ""

# Verificar dependências importantes
echo -e "${BLUE}📦 Verificando dependências de navegação...${NC}"
cd frontend
DEPS_OK=true

if npm list @react-navigation/native > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @react-navigation/native${NC}"
else
    echo -e "${RED}❌ @react-navigation/native (faltando)${NC}"
    DEPS_OK=false
fi

if npm list @react-navigation/native-stack > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @react-navigation/native-stack${NC}"
else
    echo -e "${RED}❌ @react-navigation/native-stack (faltando)${NC}"
    DEPS_OK=false
fi

if npm list @react-navigation/bottom-tabs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @react-navigation/bottom-tabs${NC}"
else
    echo -e "${RED}❌ @react-navigation/bottom-tabs (faltando)${NC}"
    DEPS_OK=false
fi

cd ..

echo ""
echo "==========================================="

# Resumo final
if [ "$ALL_FILES_OK" = true ] && [ "$DEPS_OK" = true ]; then
    echo -e "${GREEN}✅ TUDO PRONTO PARA TESTAR!${NC}"
    echo ""
    echo -e "${BLUE}📱 Para iniciar o frontend, execute:${NC}"
    echo -e "${YELLOW}   cd frontend && npm start${NC}"
    echo ""
    echo -e "${BLUE}Opções:${NC}"
    echo "   - Pressione 'a' para Android"
    echo "   - Pressione 'i' para iOS"
    echo "   - Pressione 'w' para Web"
    echo ""
    echo -e "${BLUE}🔍 Para testar as funcionalidades:${NC}"
    echo "   1. Busca: Clique no ícone de lupa no header"
    echo "   2. Notificações: Clique no ícone de sino"
    echo "   3. Comentários: Clique no ícone de comentário em um post"
    echo "   4. Conquistas: Vá ao perfil e clique no troféu"
else
    echo -e "${RED}⚠️  ATENÇÃO: Alguns problemas foram encontrados${NC}"
    echo "   Revise os erros acima antes de prosseguir."
fi

echo ""
echo -e "${BLUE}📚 Documentação:${NC} FRONTEND-NAVIGATION-INTEGRATION.md"
echo ""
