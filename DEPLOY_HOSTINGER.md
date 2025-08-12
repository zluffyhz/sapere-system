
# 🚀 Deploy do Sistema Sapere na VPS Hostinger

## 📋 Pré-requisitos

### No seu computador local:
- Node.js 18+ instalado
- SSH configurado para acessar a VPS
- Git instalado

### Na VPS Hostinger:
- Ubuntu/CentOS com acesso root
- Pelo menos 2GB RAM recomendado
- Espaço em disco: mínimo 10GB

## 🔧 Configuração da VPS

### 1. Acesso inicial à VPS
```bash
# Conectar via SSH (use os dados fornecidos pela Hostinger)
ssh root@seu-ip-da-vps

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git build-essential nginx
```

### 2. Instalar Node.js 20
```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PM2 (Process Manager)
```bash
npm install -g pm2
```

### 4. Configurar Nginx (Proxy Reverso)
```bash
# Criar configuração do site
nano /etc/nginx/sites-available/sapere
```

Cole a configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Frontend (SPA)
    location / {
        root /var/www/sapere/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket para sincronização em tempo real
    location /socket.io/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads
    location /uploads/ {
        root /var/www/sapere/backend;
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Ativar o site:
```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/sapere /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

### 5. Configurar SSL com Certbot (HTTPS gratuito)
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 6. Configurar Firewall
```bash
# UFW (Ubuntu Firewall)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

## 📦 Deploy da Aplicação

### 1. Clonar repositório na VPS
```bash
# Criar diretório
mkdir -p /var/www/sapere
cd /var/www/sapere

# Clonar projeto (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/sapere-system.git .

# Ou, se preferir, use o script de deploy do seu computador local
```

### 2. Deploy usando script automático (Recomendado)

No seu computador local:
```bash
# Editar variáveis no script deploy.sh
nano deploy.sh

# Alterar:
# VPS_HOST="seu-ip-ou-dominio"
# VPS_USER="root"  # ou seu usuário

# Executar deploy
./deploy.sh production
```

### 3. Deploy manual (alternativo)

Na VPS:
```bash
cd /var/www/sapere

# Backend
cd backend
npm install --production
npm run build

# Configurar ambiente
cp .env.production .env
nano .env  # Ajustar configurações

# Frontend  
cd ../frontend
npm install
npm run build

# Voltar ao backend e iniciar
cd ../backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔐 Configurações de Segurança

### 1. Configurar variáveis de ambiente
```bash
cd /var/www/sapere/backend
nano .env
```

Configure:
```env
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_super_segura_com_mais_de_32_caracteres
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

### 2. Permissões de arquivo
```bash
# Definir proprietário
chown -R www-data:www-data /var/www/sapere

# Definir permissões
find /var/www/sapere -type d -exec chmod 755 {} \;
find /var/www/sapere -type f -exec chmod 644 {} \;

# Permissões especiais para uploads e backups
chmod 755 /var/www/sapere/backend/uploads
chmod 755 /var/www/sapere/backend/backups
```

## 📊 Monitoramento e Manutenção

### Comandos úteis do PM2:
```bash
# Status das aplicações
pm2 status

# Logs em tempo real
pm2 logs sapere-backend

# Reiniciar aplicação
pm2 restart sapere-backend

# Recarregar sem downtime
pm2 reload sapere-backend

# Parar aplicação
pm2 stop sapere-backend

# Remover aplicação
pm2 delete sapere-backend
```

### Monitoramento de sistema:
```bash
# Uso de CPU e memória
htop

# Espaço em disco
df -h

# Status do Nginx
systemctl status nginx

# Logs do sistema
tail -f /var/log/syslog
```

## 🔄 Atualizações

### Deploy de nova versão:
```bash
# Do seu computador local
./deploy.sh production

# Ou manualmente na VPS
cd /var/www/sapere
git pull origin main
cd backend
npm install --production
npm run build
pm2 reload sapere-backend
```

## 🆘 Solução de Problemas

### 1. Aplicação não inicia:
```bash
# Verificar logs
pm2 logs sapere-backend

# Verificar porta
netstat -tlnp | grep 3002

# Testar manualmente
cd /var/www/sapere/backend
node dist/production-server.js
```

### 2. Erro de conexão com banco:
```bash
# Verificar se SQLite está funcionando
cd /var/www/sapere/backend
sqlite3 sapere_production.db ".tables"
```

### 3. Problemas de CORS:
```bash
# Verificar variável CORS_ORIGINS no .env
# Deve incluir o domínio exato da aplicação
```

### 4. SSL/HTTPS não funciona:
```bash
# Verificar certificado
certbot certificates

# Renovar se necessário
certbot renew

# Testar configuração Nginx
nginx -t
```

## 📱 Acesso Final

Após o deploy completo:

- **Frontend**: https://seu-dominio.com
- **API**: https://seu-dominio.com/api/
- **Health Check**: https://seu-dominio.com/api/health

## 👥 Usuários Padrão

- **Email**: admin@sapere.com.br
- **Senha**: admin123
- **Role**: admin

## 📞 Suporte

Se encontrar problemas durante o deploy, verifique:

1. Logs do PM2: `pm2 logs`
2. Logs do Nginx: `tail -f /var/log/nginx/error.log`
3. Status dos serviços: `systemctl status nginx`
4. Conectividade: `curl http://localhost:3002/health`

---
✅ **Sistema pronto para produção na VPS Hostinger!**