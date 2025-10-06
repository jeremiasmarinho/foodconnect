#!/bin/bash

echo "🔍 FoodConnect Network Diagnostics"
echo "=================================="
echo ""

# Check if backend is running
echo "1. Testing Backend Health..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running on port 3001"
    curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health
else
    echo "❌ Backend is NOT responding on port 3001"
    echo "   Solution: Start backend with 'npm run start:dev' in backend folder"
fi

echo ""

# Check port 3001 usage
echo "2. Checking Port 3001 Usage..."
if netstat -tlnp 2>/dev/null | grep :3001 > /dev/null; then
    echo "✅ Port 3001 is in use:"
    netstat -tlnp 2>/dev/null | grep :3001
else
    echo "❌ Port 3001 is not in use"
    echo "   This explains ERR_ADDRESS_UNREACHABLE errors"
fi

echo ""

# Test auth endpoint
echo "3. Testing Auth Endpoint..."
AUTH_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@foodconnect.com","password":"FoodConnect2024!"}' \
    -o /tmp/auth_response.json 2>/dev/null)

if [ "$AUTH_RESPONSE" = "200" ]; then
    echo "✅ Auth endpoint is working"
    echo "   Response: $(cat /tmp/auth_response.json | head -c 100)..."
else
    echo "❌ Auth endpoint failed with status: $AUTH_RESPONSE"
fi

echo ""

# Check frontend configuration
echo "4. Checking Frontend Configuration..."
if grep -q "localhost:3001" /home/devsecret/projetos/foodconnect/frontend/src/constants/theme.ts; then
    echo "✅ Frontend theme.ts is configured for port 3001"
else
    echo "❌ Frontend theme.ts may have wrong port configuration"
fi

if grep -q "3001" /home/devsecret/projetos/foodconnect/frontend/src/services/api/client.ts; then
    echo "✅ Frontend API client is configured for port 3001"
else
    echo "❌ Frontend API client may have wrong port configuration"
fi

echo ""

# Network diagnostics
echo "5. Network Diagnostics..."
echo "   Local IP addresses:"
ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print "   - " $2}' 2>/dev/null || \
ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print "   - " $2}' 2>/dev/null || \
echo "   Could not determine IP addresses"

echo ""
echo "📱 For Mobile Testing:"
echo "   Replace 'localhost' with your computer's IP address"
echo "   Example: http://192.168.1.100:3001"

echo ""
echo "🛠️  Quick Fixes:"
echo "   1. Ensure backend is running: cd backend && npm run start:dev"
echo "   2. Ensure frontend uses correct API URL"
echo "   3. For mobile: use IP address instead of localhost"
echo "   4. Check firewall allows port 3001"

rm -f /tmp/auth_response.json 2>/dev/null