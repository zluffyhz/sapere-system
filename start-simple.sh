#!/bin/bash

echo "🚀 Iniciando Sistema Sapere (Modo Simples)"

# Matar processos existentes
echo "🧹 Limpando processos..."
pkill -f "vite\|nodemon" 2>/dev/null || true

# Aguardar um pouco
sleep 2

# Iniciar backend
echo "🔧 Iniciando Backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 5

# Iniciar frontend sem verificação de tipos
echo "🌐 Iniciando Frontend..."
cd frontend
VITE_SKIP_TS_ERRORS=true npx vite --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Sistema iniciado!"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:5173/"
echo "   Backend:  http://localhost:3002/health"
echo ""
echo "🔐 Credenciais:"
echo "   Admin: admin@sapere.com.br / admin123"
echo "   Terapeuta: dra.maria@sapere.com.br / admin123"
echo ""
echo "📝 PIDs dos processos:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "💡 Para parar: Ctrl+C ou kill -9 $BACKEND_PID $FRONTEND_PID"

# Aguardar sinais
trap "echo '🛑 Parando sistema...'; kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Aguardar indefinidamente
wait