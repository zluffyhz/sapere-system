#!/bin/bash

echo "🏥 Iniciando Sapere - Sistema de Clínica"
echo ""

# Função para finalizar processos
cleanup() {
    echo ""
    echo "🛑 Finalizando serviços..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar Backend
echo "🔧 Iniciando Backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar um pouco
sleep 3

# Iniciar Frontend
echo "🌐 Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo "✅ Serviços iniciados!"
echo ""
echo "🔗 URLs disponíveis:"
echo "   Frontend: http://localhost:5173/"
echo "   Backend:  http://localhost:3002/health"
echo ""
echo "👥 Usuários de teste:"
echo "   admin@sapere.com.br (senha: admin123)"
echo "   dra.maria@sapere.com.br (senha: admin123)"
echo ""
echo "💡 Pressione Ctrl+C para finalizar"
echo ""

# Aguardar até ser finalizado
wait