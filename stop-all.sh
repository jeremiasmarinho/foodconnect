#!/bin/bash
# Script para parar todos os serviços do FoodConnect

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Parando FoodConnect..."

# Ler PIDs salvos
if [ -f "$PROJECT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_DIR/.backend.pid")
    echo "Parando backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    rm "$PROJECT_DIR/.backend.pid"
fi

if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_DIR/.frontend.pid")
    echo "Parando frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm "$PROJECT_DIR/.frontend.pid"
fi

# Garantir que todos os processos foram encerrados
pkill -f "nest start" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true

echo "✅ Todos os serviços foram parados!"
