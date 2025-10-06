#!/bin/bash

echo "🧪 Executando testes automatizados do FoodConnect..."
echo "================================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoints
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local expected_status=$4
    
    echo -e "\n${BLUE}🔍 Testando:${NC} $description"
    echo -e "${YELLOW}$method${NC} $url"
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSOU${NC} (Status: $http_code)"
        if [ "$method" = "GET" ] && [ ! -z "$body" ]; then
            echo "📄 Resposta: $(echo $body | jq -c . 2>/dev/null || echo "$body")"
        fi
    else
        echo -e "${RED}❌ FALHOU${NC} (Status: $http_code, Esperado: $expected_status)"
        echo "📄 Resposta: $body"
    fi
}

# Variáveis de teste
BASE_URL="http://localhost:3001"
USER1_ID="cmgeycxk3000gv8e49s49cada"
USER2_ID="cmgeycxhu0000v8e4t9vr2lo7"

echo -e "\n${BLUE}🚀 Testando Sistema de Usuários${NC}"
echo "=================================="

# 1. Teste de perfil básico
test_endpoint "GET" "$BASE_URL/users/$USER1_ID/profile" "Perfil básico do usuário" "200"

# 2. Teste de perfil com currentUserId
test_endpoint "GET" "$BASE_URL/users/$USER1_ID/profile?currentUserId=$USER2_ID" "Perfil com status de seguimento" "200"

# 3. Teste de seguir usuário
test_endpoint "POST" "$BASE_URL/users/$USER1_ID/follow/test?followerId=$USER2_ID" "Seguir usuário" "201"

# 4. Verificar se as estatísticas foram atualizadas
echo -e "\n${BLUE}🔄 Verificando atualização das estatísticas${NC}"
test_endpoint "GET" "$BASE_URL/users/$USER1_ID/profile?currentUserId=$USER2_ID" "Perfil após seguir" "200"

# 5. Teste de lista de seguidores
test_endpoint "GET" "$BASE_URL/users/$USER1_ID/followers" "Lista de seguidores" "200"

# 6. Teste de lista de seguindo
test_endpoint "GET" "$BASE_URL/users/$USER2_ID/following" "Lista de usuários seguindo" "200"

# 7. Teste de unfollow (executar novamente)
test_endpoint "POST" "$BASE_URL/users/$USER1_ID/follow/test?followerId=$USER2_ID" "Deixar de seguir usuário" "201"

echo -e "\n${BLUE}🚀 Testando Feed Personalizado${NC}"
echo "=============================="

# 8. Teste de feed personalizado
test_endpoint "GET" "$BASE_URL/posts/feed/personalized?userId=$USER2_ID&page=1&limit=3" "Feed personalizado" "200"

# 9. Teste de feed com filtros
test_endpoint "GET" "$BASE_URL/posts/feed/filtered?cuisine=Italiana&page=1&limit=2" "Feed com filtros" "200"

echo -e "\n${BLUE}📊 Relatório dos Testes${NC}"
echo "======================="
echo "Todos os testes foram executados!"
echo "Verifique os resultados acima para identificar possíveis falhas."
echo -e "\n${GREEN}✨ Dica:${NC} Execute este script sempre que fizer mudanças no código!"

# Executar testes unitários do Jest (se disponível)
echo -e "\n${BLUE}🧪 Executando Testes Unitários${NC}"
echo "==============================="
if command -v npm &> /dev/null; then
    if [ -f "package.json" ] && grep -q "jest" package.json; then
        npm test -- --testPathPattern=users.service.spec.ts --verbose
    else
        echo -e "${YELLOW}⚠️  Jest não configurado. Configure com: npm install --save-dev jest @types/jest${NC}"
    fi
else
    echo -e "${RED}❌ NPM não encontrado${NC}"
fi

echo -e "\n${GREEN}🎉 Testes concluídos!${NC}"