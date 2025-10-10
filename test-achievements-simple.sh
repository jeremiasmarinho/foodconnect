#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Login ==="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"achieve@test.com","password":"Test@123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: ${TOKEN:0:30}..."

echo -e "\n=== Stats Before ===" 
curl -s -X GET "$BASE_URL/achievements/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n=== Create Post 1 ==="
POST1=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"My first food post! 🍕","imageUrl":"https://example.com/pizza.jpg"}')

echo $POST1 | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Created post {data.get('id', 'ERROR')}\")"

echo -e "\n=== Check Achievements ==="
curl -s -X POST "$BASE_URL/achievements/check" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n=== User Achievements ==="
curl -s -X GET "$BASE_URL/achievements/user" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n=== Progress ==="
curl -s -X GET "$BASE_URL/achievements/progress" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"{item['achievement']['icon']} {item['achievement']['name']}: {item['progressPercentage']}% ({'EARNED' if item['earned'] else 'Not Earned'})\") for item in data]"

