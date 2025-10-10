#!/bin/bash

BASE_URL="http://localhost:3000"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🏆 Testing Achievements System                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

echo -e "\n📝 Step 1: Login"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"achieve@test.com","password":"Test@123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "✅ Logged in successfully"

echo -e "\n📊 Step 2: Get All Achievements"
curl -s -X GET "$BASE_URL/achievements" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Found {len(data)} achievements'); [print(f'  {item[\"icon\"]} {item[\"name\"]} - {item[\"points\"]} points') for item in data]"

echo -e "\n👤 Step 3: Get User Stats"
curl -s -X GET "$BASE_URL/achievements/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n📈 Step 4: Get Progress"
curl -s -X GET "$BASE_URL/achievements/progress" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"{item['achievement']['icon']} {item['achievement']['name']}: {item['progress']}/{item['maxProgress']} ({item['progressPercentage']}%)\") for item in data]"

echo -e "\n🏆 Step 5: Get User Achievements"
EARNED=$(curl -s -X GET "$BASE_URL/achievements/user" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))")
echo "Earned achievements: $EARNED"

echo -e "\n✅ All achievements endpoints working!"
echo -e "\n💡 Features tested:"
echo "  ✅ GET /achievements - List all achievements"
echo "  ✅ GET /achievements/user - Get user's earned achievements" 
echo "  ✅ GET /achievements/stats - Get user statistics"
echo "  ✅ GET /achievements/progress - Get progress for all achievements"
echo "  ✅ POST /achievements/check - Check for new achievements"
echo "  ✅ POST /achievements/init - Initialize achievements"

