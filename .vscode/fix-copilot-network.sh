#!/bin/bash
# Script completo para resolver ERR_NETWORK_CHANGED do Copilot

echo "=== Solução Completa para ERR_NETWORK_CHANGED do GitHub Copilot ==="
echo ""

# 1. Limpar cache do Copilot
echo "1. Limpando cache do GitHub Copilot..."
rm -rf ~/.vscode-server/data/User/globalStorage/github.copilot* 2>/dev/null
rm -rf ~/.vscode-server/data/User/workspaceStorage/*/github.copilot* 2>/dev/null
echo "   ✓ Cache limpo"

# 2. Estabilizar rede
echo "2. Estabilizando configuração de rede..."
nmcli connection modify "Wired connection 1" ipv6.method "disabled" 2>/dev/null
nmcli connection modify "Wired connection 1" ipv4.dns-priority -50 2>/dev/null
nmcli connection modify "Wired connection 1" ipv4.route-metric 100 2>/dev/null
nmcli connection down "Wired connection 1" 2>/dev/null
sleep 2
nmcli connection up "Wired connection 1" 2>/dev/null
echo "   ✓ Rede configurada"

# 3. Testar conectividade
echo "3. Testando conectividade..."
if ping -c 2 github.com > /dev/null 2>&1; then
    echo "   ✓ Conectividade OK"
else
    echo "   ✗ Problema de conectividade detectado"
fi

# 4. Verificar DNS
echo "4. Verificando DNS..."
if nslookup copilot-proxy.githubusercontent.com > /dev/null 2>&1; then
    echo "   ✓ DNS resolvendo corretamente"
else
    echo "   ✗ Problema com DNS"
fi

echo ""
echo "=== PRÓXIMOS PASSOS ==="
echo "1. Pressione Ctrl+Shift+P no VS Code"
echo "2. Digite 'Developer: Reload Window' e pressione Enter"
echo "3. Se o erro persistir, feche COMPLETAMENTE o VS Code e reabra"
echo "4. Como última alternativa, reinicie o computador"
echo ""
echo "=== SOLUÇÃO ALTERNATIVA ==="
echo "Se o erro continuar, pode ser um problema temporário do serviço do GitHub Copilot."
echo "Aguarde alguns minutos e tente novamente."
echo ""
