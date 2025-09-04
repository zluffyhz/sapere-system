#!/bin/bash

# Script de Deploy para VPS Hostinger
# Uso: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="sapere-system"
# VPS_USER="root"  # Alterar conforme necessário  
# VPS_HOST="seu-servidor.hostinger.com"  # Alterar para seu domínio/IP
# VPS_PATH="/var/www/sapere"

echo "🚀 Iniciando deploy do Sistema Sapere..."
echo "📍 Ambiente: $ENVIRONMENT"
echo "🌐 Servidor: $VPS_HOST"

# Função para executar comandos remotos
remote_exec() {
    ssh "$VPS_USER@$VPS_HOST" "$1"
}

# Função para copiar arquivos
copy_files() {
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '*.log' \
        --exclude 'uploads' \
        --exclude 'backups' \
        --exclude '.env.local' \
        ./ "$VPS_USER@$VPS_HOST:$VPS_PATH/"
}

echo "📦 Preparando build local..."

# Build do frontend
cd frontend
npm install
npm run build
cd ..

# Build do backend
cd backend
npm install
npm run build
cd ..

echo "📤 Enviando arquivos para servidor..."
copy_files

echo "🔧 Configurando servidor remoto..."

# Instalar dependências e configurar no servidor
remote_exec "
    cd $VPS_PATH

    # Instalar Node.js se necessário (usando NodeSource)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        apt-get install -y nodejs
    fi

    # Instalar PM2 globalmente se necessário
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    # Criar diretórios necessários
    mkdir -p /var/log/sapere
    mkdir -p uploads
    mkdir -p backups

    # Configurar permissões
    chown -R www-data:www-data uploads backups
    chmod 755 uploads backups

    # Backend
    cd backend
    npm install --production
    
    # Copiar arquivo de ambiente
    if [ '$ENVIRONMENT' = 'production' ]; then
        cp .env.production .env
    fi

    # Parar aplicação existente
    pm2 delete sapere-backend || true

    # Iniciar aplicação
    pm2 start ecosystem.config.js --env $ENVIRONMENT
    
    # Salvar configuração PM2
    pm2 save
    pm2 startup

    echo '✅ Deploy concluído com sucesso!'
"

# Verificar se a aplicação está rodando
echo "🔍 Verificando status da aplicação..."
sleep 5

# Testar health check
if curl -f "http://$VPS_HOST:3002/health" > /dev/null 2>&1; then
    echo "✅ Aplicação está rodando e respondendo!"
else
    echo "⚠️  Aplicação pode não estar respondendo. Verifique os logs."
fi

echo "📊 Status PM2:"
remote_exec "pm2 status"

echo ""
echo "🎉 Deploy finalizado!"
echo "🌐 Frontend: http://$VPS_HOST"
echo "🔧 Backend: http://$VPS_HOST:3002"
echo "📊 Health Check: http://$VPS_HOST:3002/health"
echo ""
echo "📝 Para verificar logs:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo "   pm2 logs sapere-backend"
echo ""
echo "🔄 Para redeploy:"
echo "   ./deploy.sh $ENVIRONMENT"