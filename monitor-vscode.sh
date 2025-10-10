#!/bin/bash
# Script para monitorar performance do VS Code
# Uso: ./monitor-vscode.sh

echo "🔍 Monitorando VS Code..."
echo ""

# Processos VS Code
echo "📊 Processos VS Code:"
ps aux | grep -E "code|tsserver|eslint" | grep -v grep | awk '{printf "PID: %-7s CPU: %5s%% MEM: %5s%% CMD: %s\n", $2, $3, $4, substr($0, index($0,$11))}'

echo ""
echo "💾 Uso de Memória:"
free -h | grep Mem

echo ""
echo "🔥 Top 5 processos por CPU:"
ps aux --sort=-%cpu | head -6 | awk 'NR==1 {print; next} {printf "%-10s %5s%% %5s%% %s\n", $2, $3, $4, substr($0, index($0,$11))}'

echo ""
echo "📁 Arquivos TypeScript:"
echo "Total: $(find . -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "Sem node_modules: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)"
