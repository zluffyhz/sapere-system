#!/bin/bash

# Script para preparar o sistema para deploy
# Uso: ./prepare-deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Preparando Sistema Sapere para deploy..."
echo "📍 Ambiente: $ENVIRONMENT"

# Verificar se estamos na raiz do projeto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Execute este script na raiz do projeto Sapere"
    exit 1
fi

echo "📦 Instalando dependências..."

# Backend
echo "🔧 Backend..."
cd backend
npm install
npm run build
cd ..

# Frontend  
echo "🎨 Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🧪 Executando testes de build..."

# Verificar se os builds foram criados
if [ ! -d "backend/dist" ]; then
    echo "❌ Build do backend falhou"
    exit 1
fi

if [ ! -d "frontend/dist" ]; then
    echo "❌ Build do frontend falhou"
    exit 1
fi

echo "📋 Verificando configurações..."

# Verificar arquivos de ambiente
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "backend/.env.production" ]; then
        echo "⚠️  Arquivo backend/.env.production não encontrado"
        echo "   Copiando .env.example..."
        cp backend/.env.example backend/.env.production
    fi
    
    if [ ! -f "frontend/.env.production" ]; then
        echo "⚠️  Arquivo frontend/.env.production não encontrado"  
        echo "   Criando com configurações padrão..."
        echo "VITE_API_URL=https://seu-dominio.com/api" > frontend/.env.production
    fi
fi

echo "🗃️ Preparando estrutura de dados..."

# Criar diretórios necessários
mkdir -p backend/uploads
mkdir -p backend/backups
mkdir -p backend/logs

echo "📊 Estatísticas do build:"
echo "   Backend: $(du -sh backend/dist | cut -f1)"
echo "   Frontend: $(du -sh frontend/dist | cut -f1)"
echo "   Total uploads: $(find backend/uploads -type f 2>/dev/null | wc -l || echo 0) arquivos"

echo ""
echo "✅ Sistema preparado para deploy!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure as variáveis de ambiente em .env.production"
echo "   2. Suba os arquivos para seu servidor"
echo "   3. Execute: npm start --production"
echo ""
echo "🔗 URLs locais para teste:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3002"
echo "   Health Check: http://localhost:3002/health"
echo ""
echo "👥 Contas de teste:"
echo "   Admin: admin@sapere.com.br (senha: admin123)"
echo "   Profissional: dra.maria@sapere.com.br (senha: admin123)"