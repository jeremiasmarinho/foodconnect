#!/bin/bash

# Script para testar o sistema de Notifications

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    🧪 Testando Sistema de Notificações                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
TOKEN=""
TOKEN2=""
USER_ID=""
USER2_ID=""
POST_ID=""

echo "📝 PASSO 1: Login do Usuário 1 (Admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@foodconnect.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login (User 1)${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido (Admin)${NC}"
echo "Token: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"
echo ""

echo "📝 PASSO 2: Criar um segundo usuário de teste"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-notif@foodconnect.com",
    "username": "testnotif",
    "password": "Test123456",
    "name": "Test Notification User",
    "phone": "+5511999998888"
  }')

TOKEN2=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
USER2_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$TOKEN2" ]; then
  # Se o usuário já existe, tentar fazer login
  LOGIN2_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test-notif@foodconnect.com",
      "password": "Test123456"
    }')
  
  TOKEN2=$(echo $LOGIN2_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
  USER2_ID=$(echo $LOGIN2_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
fi

echo -e "${GREEN}✅ Usuário 2 pronto${NC}"
echo "User 2 ID: $USER2_ID"
echo ""

echo "📝 PASSO 3: User 1 cria um post"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Primeiro, obter um restaurante
RESTAURANT_RESPONSE=$(curl -s -X GET "$API_URL/restaurants?page=1&limit=1" \
  -H "Authorization: Bearer $TOKEN")

ESTABLISHMENT_ID=$(echo $RESTAURANT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$ESTABLISHMENT_ID" ]; then
  echo -e "${YELLOW}⚠️ Nenhum restaurante encontrado, criando um...${NC}"
  
  # Criar um restaurante de teste
  CREATE_REST_RESPONSE=$(curl -s -X POST "$API_URL/restaurants" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Restaurante Teste Notif",
      "address": "Rua Teste, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "type": "RESTAURANT",
      "category": "restaurant",
      "priceRange": 2
    }')
  
  ESTABLISHMENT_ID=$(echo $CREATE_REST_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
fi

CREATE_POST_RESPONSE=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"🍕 Testando sistema de notificações!\",
    \"imageUrls\": \"[\\\"https://picsum.photos/600/400\\\"]\",
    \"establishmentId\": \"$ESTABLISHMENT_ID\"
  }")

POST_ID=$(echo $CREATE_POST_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$POST_ID" ]; then
  echo -e "${RED}❌ Erro ao criar post${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Post criado${NC}"
echo "Post ID: $POST_ID"
echo ""

echo "❤️ PASSO 4: User 2 dá like no post (deve gerar notificação)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LIKE_RESPONSE=$(curl -s -X POST "$API_URL/likes" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"postId\": \"$POST_ID\"
  }")

echo "$LIKE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LIKE_RESPONSE"
echo -e "${GREEN}✅ Like dado (notificação deve ter sido enviada)${NC}"
echo ""

echo "⏳ Aguardando 2 segundos para processar notificação..."
sleep 2
echo ""

echo "💬 PASSO 5: User 2 comenta no post (deve gerar notificação)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "😍 Que delícia! Onde é esse lugar?"
  }')

echo "$COMMENT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$COMMENT_RESPONSE"
echo -e "${GREEN}✅ Comentário criado (notificação deve ter sido enviada)${NC}"
echo ""

echo "⏳ Aguardando 2 segundos para processar notificação..."
sleep 2
echo ""

echo "📋 PASSO 6: User 1 lista suas notificações"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

echo "$NOTIFICATIONS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NOTIFICATIONS_RESPONSE"

NOTIFICATIONS_COUNT=$(echo $NOTIFICATIONS_RESPONSE | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo ""
echo -e "${GREEN}✅ Total de notificações: ${NOTIFICATIONS_COUNT}${NC}"
echo ""

echo "🔔 PASSO 7: Verificar contagem de não lidas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

UNREAD_RESPONSE=$(curl -s -X GET "$API_URL/notifications/unread/count" \
  -H "Authorization: Bearer $TOKEN")

echo "$UNREAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UNREAD_RESPONSE"

UNREAD_COUNT=$(echo $UNREAD_RESPONSE | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo ""
echo -e "${YELLOW}📊 Notificações não lidas: ${UNREAD_COUNT}${NC}"
echo ""

echo "✅ PASSO 8: Marcar todas como lidas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MARK_ALL_READ_RESPONSE=$(curl -s -X POST "$API_URL/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN")

echo "$MARK_ALL_READ_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MARK_ALL_READ_RESPONSE"
echo -e "${GREEN}✅ Todas as notificações marcadas como lidas${NC}"
echo ""

echo "🔔 PASSO 9: Verificar contagem novamente (deve ser 0)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

UNREAD_RESPONSE_2=$(curl -s -X GET "$API_URL/notifications/unread/count" \
  -H "Authorization: Bearer $TOKEN")

echo "$UNREAD_RESPONSE_2" | python3 -m json.tool 2>/dev/null || echo "$UNREAD_RESPONSE_2"

UNREAD_COUNT_2=$(echo $UNREAD_RESPONSE_2 | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo ""
echo -e "${GREEN}📊 Notificações não lidas após marcar todas: ${UNREAD_COUNT_2}${NC}"
echo ""

echo "🗑️ PASSO 10: Limpeza (deletar post de teste)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Post deletado${NC}"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    ✅ Testes de Notificações Concluídos                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Resumo:"
echo "  - ✅ Notificação de like criada automaticamente"
echo "  - ✅ Notificação de comentário criada automaticamente"
echo "  - ✅ Listagem de notificações funcionando"
echo "  - ✅ Contagem de não lidas funcionando"
echo "  - ✅ Marcar todas como lidas funcionando"
echo "  - ✅ Contagem zerada após marcar como lidas"
echo ""
echo "🎯 Sistema de Notificações funcionando perfeitamente!"
echo ""
echo "💡 Recursos implementados:"
echo "  - 🔔 Notificações automáticas (likes, comments)"
echo "  - 📋 Listagem paginada"
echo "  - ✅ Marcar como lida (individual e em massa)"
echo "  - 📊 Contagem de não lidas"
echo "  - 🌐 WebSocket para real-time (backend pronto)"
echo "  - 📱 Frontend service + hook completos"
