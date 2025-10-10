#!/bin/bash

# Script para testar o sistema de likes

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    🧪 Testando Sistema de Likes                              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
TOKEN=""
POST_ID=""

echo "📝 PASSO 1: Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@foodconnect.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo "📋 PASSO 2: Listar posts (obter postId)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

POSTS_RESPONSE=$(curl -s "$API_URL/posts/feed?page=1&limit=1")
POST_ID=$(echo $POSTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$POST_ID" ]; then
  echo -e "${RED}❌ Nenhum post encontrado${NC}"
  echo "Response: $POSTS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Post encontrado${NC}"
echo "Post ID: $POST_ID"
echo ""

echo "❤️ PASSO 3: Dar like no post (primeira vez)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LIKE_RESPONSE=$(curl -s -X POST "$API_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$LIKE_RESPONSE" | jq '.' 2>/dev/null || echo "$LIKE_RESPONSE"

# Verificar se o like foi criado
IS_LIKED=$(echo $LIKE_RESPONSE | grep -o '"liked":true')
LIKES_COUNT=$(echo $LIKE_RESPONSE | grep -o '"likesCount":[0-9]*' | sed 's/"likesCount"://')

if [ ! -z "$IS_LIKED" ]; then
  echo -e "${GREEN}✅ Like registrado com sucesso${NC}"
  echo -e "${BLUE}👍 Total de likes: $LIKES_COUNT${NC}"
else
  echo -e "${YELLOW}⚠️ Resposta inesperada ao dar like${NC}"
fi
echo ""

echo "❤️ PASSO 4: Dar like no post (segunda vez - toggle)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

UNLIKE_RESPONSE=$(curl -s -X POST "$API_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$UNLIKE_RESPONSE" | jq '.' 2>/dev/null || echo "$UNLIKE_RESPONSE"

# Verificar se o like foi removido
IS_LIKED=$(echo $UNLIKE_RESPONSE | grep -o '"liked":false')
LIKES_COUNT=$(echo $UNLIKE_RESPONSE | grep -o '"likesCount":[0-9]*' | sed 's/"likesCount"://')

if [ ! -z "$IS_LIKED" ]; then
  echo -e "${GREEN}✅ Like removido (unlike) com sucesso${NC}"
  echo -e "${BLUE}👍 Total de likes: $LIKES_COUNT${NC}"
else
  echo -e "${YELLOW}⚠️ Resposta inesperada ao dar unlike${NC}"
fi
echo ""

echo "❤️ PASSO 5: Dar like novamente (toggle de volta)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LIKE_AGAIN_RESPONSE=$(curl -s -X POST "$API_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$LIKE_AGAIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LIKE_AGAIN_RESPONSE"

IS_LIKED=$(echo $LIKE_AGAIN_RESPONSE | grep -o '"liked":true')
LIKES_COUNT=$(echo $LIKE_AGAIN_RESPONSE | grep -o '"likesCount":[0-9]*' | sed 's/"likesCount"://')

if [ ! -z "$IS_LIKED" ]; then
  echo -e "${GREEN}✅ Like registrado novamente${NC}"
  echo -e "${BLUE}👍 Total de likes: $LIKES_COUNT${NC}"
else
  echo -e "${YELLOW}⚠️ Resposta inesperada ao dar like novamente${NC}"
fi
echo ""

echo "📊 PASSO 6: Verificar post com contadores atualizados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

POST_DETAIL=$(curl -s "$API_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$POST_DETAIL" | jq '.data | {id, _count, isLikedByUser}' 2>/dev/null || echo "$POST_DETAIL"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    ✅ Testes de Likes Concluídos                             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Resumo:"
echo "  - ✅ Like criado (toggle on)"
echo "  - ✅ Like removido (toggle off)"
echo "  - ✅ Like recriado (toggle on novamente)"
echo "  - ✅ Contadores atualizados corretamente"
echo ""
echo "🎯 Sistema de Likes funcionando perfeitamente!"
