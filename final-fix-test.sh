#!/bin/bash

echo "🔧 FINAL FIX VERIFICATION"
echo "========================"
echo ""

# Test current IP
CURRENT_IP=$(hostname -I | awk '{print $1}')
echo "📍 Current Machine IP: $CURRENT_IP"
echo ""

# Test both configurations
echo "🌐 Testing Web Configuration (localhost:3001)..."
WEB_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/health 2>/dev/null)
if [ "$WEB_RESPONSE" = "200" ]; then
    echo "✅ Web (localhost:3001): WORKING"
else
    echo "❌ Web (localhost:3001): FAILED ($WEB_RESPONSE)"
fi

echo ""
echo "📱 Testing Mobile Configuration ($CURRENT_IP:3001)..."
MOBILE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://$CURRENT_IP:3001/health 2>/dev/null)
if [ "$MOBILE_RESPONSE" = "200" ]; then
    echo "✅ Mobile ($CURRENT_IP:3001): WORKING"
else
    echo "❌ Mobile ($CURRENT_IP:3001): FAILED ($MOBILE_RESPONSE)"
fi

echo ""
echo "🔍 Configuration Files Check:"

# Check client.ts
if grep -q "$CURRENT_IP:3001" /home/devsecret/projetos/foodconnect/frontend/src/services/api/client.ts; then
    echo "✅ client.ts: Using correct IP ($CURRENT_IP)"
else
    echo "❌ client.ts: NOT using correct IP"
fi

# Check if unified config exists
if [ -f "/home/devsecret/projetos/foodconnect/frontend/src/config/api.ts" ]; then
    echo "✅ Unified API config: EXISTS"
else
    echo "❌ Unified API config: MISSING"
fi

echo ""
echo "🧪 Testing Auth Login with Both URLs:"

# Test localhost login
echo "Testing localhost login..."
LOCALHOST_LOGIN=$(curl -s -w "%{http_code}" -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@foodconnect.com","password":"FoodConnect2024!"}' \
    -o /tmp/localhost_login.json 2>/dev/null)

if [ "$LOCALHOST_LOGIN" = "200" ]; then
    echo "✅ Localhost login: SUCCESS"
else
    echo "❌ Localhost login: FAILED ($LOCALHOST_LOGIN)"
fi

# Test IP login
echo "Testing IP login..."
IP_LOGIN=$(curl -s -w "%{http_code}" -X POST http://$CURRENT_IP:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@foodconnect.com","password":"FoodConnect2024!"}' \
    -o /tmp/ip_login.json 2>/dev/null)

if [ "$IP_LOGIN" = "200" ]; then
    echo "✅ IP login: SUCCESS"
else
    echo "❌ IP login: FAILED ($IP_LOGIN)"
fi

echo ""
echo "📊 SUMMARY:"
if [ "$WEB_RESPONSE" = "200" ] && [ "$MOBILE_RESPONSE" = "200" ] && [ "$LOCALHOST_LOGIN" = "200" ] && [ "$IP_LOGIN" = "200" ]; then
    echo "🎉 ALL TESTS PASSED - ERR_ADDRESS_UNREACHABLE SHOULD BE FIXED!"
    echo ""
    echo "✅ Web app should work on: http://localhost:8081"
    echo "✅ Mobile app should work with QR code"
    echo "✅ Login should work on both platforms"
else
    echo "❌ Some tests failed - issue may persist"
    echo ""
    echo "Debug info:"
    echo "  Web Response: $WEB_RESPONSE"
    echo "  Mobile Response: $MOBILE_RESPONSE" 
    echo "  Localhost Login: $LOCALHOST_LOGIN"
    echo "  IP Login: $IP_LOGIN"
fi

# Cleanup
rm -f /tmp/localhost_login.json /tmp/ip_login.json 2>/dev/null

echo ""
echo "🛠️  Next Steps:"
echo "1. Restart the frontend server to pick up configuration changes"
echo "2. Test login in web browser"
echo "3. Test on mobile device if needed"