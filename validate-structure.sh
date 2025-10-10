#!/bin/bash
# Script de teste para validar a estr# 5. Verificar API Client
echo "5️⃣ Verificando API Client..."
if grep -q "baseURL.*localhost:3000" frontend/src/api/client.ts; then
    echo "   ✅ API Client usa porta 3000"
else
    echo "   ❌ API Client não usa porta 3000"
    exit 1
fi

# 6. Verificar .env do backend
echo "6️⃣ Verificando Backend .env..."ojeto

echo "🔍 Validando estrutura do FoodConnect..."
echo ""

# 1. Verificar providers
echo "1️⃣ Verificando Providers..."
if grep -q "export.*AuthProvider.*useAuth" frontend/src/providers/index.ts; then
    echo "   ✅ AuthProvider exportado corretamente"
else
    echo "   ❌ Problema com AuthProvider"
    exit 1
fi

# 2. Verificar imports do LoginScreen
echo "2️⃣ Verificando LoginScreen..."
if grep -q "import.*useAuth.*from.*providers" frontend/src/screens/auth/LoginScreen.tsx; then
    echo "   ✅ LoginScreen importa de providers"
else
    echo "   ❌ LoginScreen não importa de providers"
    exit 1
fi

# 3. Verificar imports do RegisterScreen
echo "3️⃣ Verificando RegisterScreen..."
if grep -q "import.*useAuth.*from.*providers" frontend/src/screens/auth/RegisterScreen.tsx; then
    echo "   ✅ RegisterScreen importa de providers"
else
    echo "   ❌ RegisterScreen não importa de providers"
    exit 1
fi

# 4. Verificar hooks
echo "4️⃣ Verificando Hooks..."
if grep -q "import.*useAuth.*from.*providers" frontend/src/hooks/useRealPosts.ts; then
    echo "   ✅ useRealPosts importa de providers"
else
    echo "   ❌ useRealPosts não importa de providers"
    exit 1
fi

if grep -q "import.*useAuth.*from.*providers" frontend/src/hooks/useComments.ts; then
    echo "   ✅ useComments importa de providers"
else
    echo "   ❌ useComments não importa de providers"
    exit 1
fi

# 5. Verificar API Client
echo "4️⃣ Verificando API Client..."
if grep -q "baseURL.*localhost:3000" frontend/src/api/client.ts; then
    echo "   ✅ API Client usa porta 3000"
else
    echo "   ❌ API Client não usa porta 3000"
    exit 1
fi

# 6. Verificar .env do backend
echo "6️⃣ Verificando Backend .env..."
if grep -q "PORT=3000" backend/.env; then
    echo "   ✅ Backend configurado para porta 3000"
else
    echo "   ❌ Backend não usa porta 3000"
    exit 1
fi

# 7. Verificar App.tsx
echo "7️⃣ Verificando App.tsx..."
if grep -q "AuthProvider.*ThemeProvider.*QueryProvider" frontend/App.tsx; then
    echo "   ✅ App.tsx tem providers corretos"
else
    echo "   ❌ App.tsx com providers incorretos"
    exit 1
fi

echo ""
echo "✅ Todas as validações passaram!"
echo "✅ Estrutura do projeto está correta!"
