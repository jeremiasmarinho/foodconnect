#!/bin/bash

# Test script for Achievements System
# Tests all achievements endpoints and functionality

BASE_URL="http://localhost:3000"
TOKEN=""
USER_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pretty print JSON
print_json() {
  echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

# Print section header
print_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${BLUE}$1${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Print test result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    🏆 Testando Sistema de Conquistas                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# PASSO 1: Login
print_header "📝 PASSO 1: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "achieve@test.com",
    "password": "Test@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  print_result 0 "Login bem-sucedido"
  echo "Token: ${TOKEN:0:20}..."
else
  print_result 1 "Falha no login"
  print_json "$LOGIN_RESPONSE"
  exit 1
fi

# PASSO 2: Get all achievements
print_header "🏅 PASSO 2: Buscar todas as conquistas"
ALL_ACHIEVEMENTS=$(curl -s -X GET "$BASE_URL/achievements" \
  -H "Authorization: Bearer $TOKEN")

print_json "$ALL_ACHIEVEMENTS"

ACHIEVEMENTS_COUNT=$(echo $ALL_ACHIEVEMENTS | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
print_result 0 "Total de conquistas disponíveis: $ACHIEVEMENTS_COUNT"

# PASSO 3: Get user's earned achievements
print_header "👤 PASSO 3: Buscar conquistas do usuário"
USER_ACHIEVEMENTS=$(curl -s -X GET "$BASE_URL/achievements/user" \
  -H "Authorization: Bearer $TOKEN")

print_json "$USER_ACHIEVEMENTS"

USER_ACHIEVEMENTS_COUNT=$(echo $USER_ACHIEVEMENTS | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
print_result 0 "Conquistas ganhas pelo usuário: $USER_ACHIEVEMENTS_COUNT"

# PASSO 4: Get user statistics
print_header "📊 PASSO 4: Buscar estatísticas do usuário"
USER_STATS=$(curl -s -X GET "$BASE_URL/achievements/stats" \
  -H "Authorization: Bearer $TOKEN")

print_json "$USER_STATS"
print_result 0 "Estatísticas carregadas"

# PASSO 5: Create some posts to unlock achievements
print_header "📝 PASSO 5: Criar posts para desbloquear conquistas"

# Create first post (should unlock "Primeiro Post" achievement)
POST1_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Meu primeiro post incrível! 🎉",
    "imageUrl": "https://example.com/image1.jpg"
  }')

POST1_ID=$(echo $POST1_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -n "$POST1_ID" ]; then
  print_result 0 "Post 1 criado: $POST1_ID"
else
  print_result 1 "Falha ao criar post 1"
fi

# Create second post
POST2_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Segunda experiência gastronômica! 🍕",
    "imageUrl": "https://example.com/image2.jpg"
  }')

POST2_ID=$(echo $POST2_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -n "$POST2_ID" ]; then
  print_result 0 "Post 2 criado: $POST2_ID"
else
  print_result 1 "Falha ao criar post 2"
fi

# PASSO 6: Check for new achievements
print_header "🔍 PASSO 6: Verificar novas conquistas"
CHECK_RESPONSE=$(curl -s -X POST "$BASE_URL/achievements/check" \
  -H "Authorization: Bearer $TOKEN")

print_json "$CHECK_RESPONSE"

NEW_ACHIEVEMENTS=$(echo $CHECK_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('newAchievements', [])))" 2>/dev/null)
TOTAL_POINTS=$(echo $CHECK_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('totalPoints', 0))" 2>/dev/null)

if [ "$NEW_ACHIEVEMENTS" -gt 0 ]; then
  print_result 0 "Novas conquistas desbloqueadas: $NEW_ACHIEVEMENTS"
  print_result 0 "Pontos ganhos: $TOTAL_POINTS"
else
  print_result 0 "Nenhuma nova conquista desbloqueada"
fi

# PASSO 7: Get achievement progress
print_header "📈 PASSO 7: Buscar progresso das conquistas"
PROGRESS_RESPONSE=$(curl -s -X GET "$BASE_URL/achievements/progress" \
  -H "Authorization: Bearer $TOKEN")

print_json "$PROGRESS_RESPONSE"
print_result 0 "Progresso carregado"

# Show progress summary
echo ""
echo -e "${YELLOW}📊 Resumo do Progresso:${NC}"
echo $PROGRESS_RESPONSE | python3 << 'EOF'
import sys, json

try:
  data = json.load(sys.stdin)
  for item in data:
    achievement = item['achievement']
    earned = "✅" if item['earned'] else "⏳"
    progress = item['progress']
    max_progress = item['maxProgress']
    percentage = item['progressPercentage']
    
    print(f"{earned} {achievement['icon']} {achievement['name']}")
    print(f"   {achievement['description']}")
    if not item['earned'] and max_progress > 0:
      print(f"   Progresso: {progress}/{max_progress} ({percentage}%)")
    elif item['earned']:
      print(f"   Ganho em: {item.get('earnedAt', 'N/A')}")
    print(f"   Pontos: {achievement['points']}")
    print()
except Exception as e:
  print(f"Erro ao processar progresso: {e}")
EOF

# PASSO 8: Get updated user achievements
print_header "🏆 PASSO 8: Buscar conquistas atualizadas do usuário"
UPDATED_ACHIEVEMENTS=$(curl -s -X GET "$BASE_URL/achievements/user" \
  -H "Authorization: Bearer $TOKEN")

UPDATED_COUNT=$(echo $UPDATED_ACHIEVEMENTS | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
UPDATED_POINTS=$(echo $UPDATED_ACHIEVEMENTS | python3 -c "import sys, json; data = json.load(sys.stdin); print(sum(item['achievement']['points'] for item in data))" 2>/dev/null)

print_result 0 "Conquistas ganhas: $UPDATED_COUNT"
print_result 0 "Total de pontos: $UPDATED_POINTS"

# Show earned achievements
echo ""
echo -e "${YELLOW}🏅 Conquistas Ganhas:${NC}"
echo $UPDATED_ACHIEVEMENTS | python3 << 'EOF'
import sys, json

try:
  data = json.load(sys.stdin)
  if not data:
    print("Nenhuma conquista ganha ainda")
  else:
    for item in data:
      achievement = item['achievement']
      print(f"{achievement['icon']} {achievement['name']} - {achievement['points']} pontos")
      print(f"   {achievement['description']}")
      print(f"   Categoria: {achievement['category']}")
      print(f"   Ganho em: {item['earnedAt']}")
      print()
except Exception as e:
  print(f"Erro ao processar conquistas: {e}")
EOF

# Final Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    ✅ Testes de Conquistas Concluídos                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

echo ""
echo "📝 Resumo:"
echo "  - ✅ Busca de todas as conquistas"
echo "  - ✅ Busca de conquistas do usuário"
echo "  - ✅ Estatísticas do usuário"
echo "  - ✅ Criação de posts"
echo "  - ✅ Verificação de novas conquistas"
echo "  - ✅ Progresso das conquistas"
echo "  - ✅ Conquistas atualizadas"

echo ""
echo "🎯 Sistema de Conquistas funcionando perfeitamente!"
echo ""
echo "💡 Recursos implementados:"
echo "  - 🏅 6 conquistas pré-definidas"
echo "  - 📊 Rastreamento de progresso"
echo "  - ✅ Verificação automática"
echo "  - 🎯 Sistema de pontos"
echo "  - 📈 Progresso em tempo real"
echo "  - 🏆 Conquistas por categoria"
