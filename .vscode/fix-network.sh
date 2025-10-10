#!/bin/bash
# Script para estabilizar a rede e evitar ERR_NETWORK_CHANGED

echo "Estabilizando conexão de rede para VS Code/Copilot..."

# Priorizar interface principal
nmcli connection modify "Wired connection 1" ipv6.method "disabled" 2>/dev/null
nmcli connection modify "Wired connection 1" ipv4.dns-priority -50 2>/dev/null
nmcli connection modify "Wired connection 1" ipv4.route-metric 100 2>/dev/null

# Reiniciar conexão
nmcli connection down "Wired connection 1" 2>/dev/null
nmcli connection up "Wired connection 1" 2>/dev/null

echo "Configurações aplicadas! Aguarde 5 segundos..."
sleep 5

echo "Testando conectividade..."
ping -c 3 github.com

echo "Rotas ativas:"
ip route show | grep default

echo ""
echo "✓ Agora recarregue a janela do VS Code: Ctrl+Shift+P -> 'Developer: Reload Window'"
echo "✓ Ou feche e reabra o VS Code completamente"
