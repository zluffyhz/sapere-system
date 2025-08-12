# 🚀 Instruções de Deploy - Sistema Sapere

## ⚡ Deploy Rápido (Local/Desenvolvimento)

### 1. Iniciar o Sistema
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Acessar o Sistema
- **URL**: http://localhost:5173
- **Login**: admin@sapere.com.br
- **Senha**: admin123

---

## 🌐 Deploy em Produção

### 1. Preparar para Deploy
```bash
# Na raiz do projeto
./prepare-deploy.sh production
```

### 2. Configurar Servidor (VPS/Cloud)
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Criar estrutura
sudo mkdir -p /var/www/sapere
sudo chown -R $USER:$USER /var/www/sapere
```

### 3. Fazer Upload dos Arquivos
```bash
# Opção 1: rsync (recomendado)
rsync -avz --exclude 'node_modules' ./ usuario@servidor:/var/www/sapere/

# Opção 2: Git
git clone https://github.com/seu-usuario/sapere-system.git /var/www/sapere
```

### 4. Configurar no Servidor
```bash
cd /var/www/sapere

# Backend
cd backend
cp .env.example .env.production
nano .env.production  # Editar configurações

npm install --production
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save

# Frontend (servir estático com Nginx)
cd ../frontend
# Arquivos já estão em dist/ após prepare-deploy.sh
```

### 5. Configurar Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Frontend
    location / {
        root /var/www/sapere/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Preparar sistema
./prepare-deploy.sh development

# Verificar logs
tail -f backend/server.log

# Verificar tipos
cd frontend && npm run typecheck
cd backend && npm run typecheck
```

### Produção
```bash
# Status do sistema
pm2 status
pm2 logs sapere-backend

# Restart
pm2 restart sapere-backend

# Monitoramento
pm2 monit

# Backup banco
cp backend/sapere_dev.db backups/sapere_$(date +%Y%m%d).db
```

---

## 🆘 Resolução de Problemas

### Backend não inicia
```bash
# Verificar logs
pm2 logs sapere-backend

# Verificar porta
lsof -i:3002

# Restart limpo
pm2 delete sapere-backend
pm2 start ecosystem.config.js --env production
```

### Frontend não carrega
```bash
# Rebuild
cd frontend
npm run build

# Verificar dist/
ls -la dist/

# Verificar nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Banco de dados
```bash
# Verificar arquivo
ls -la backend/sapere_dev.db

# Recriar se necessário
cd backend
rm sapere_dev.db
npm run migrate
```

---

## 📞 Suporte

- **Documentação**: README.md
- **Funcionalidades**: FUNCIONALIDADES_IMPLEMENTADAS.md
- **Checklist**: CHECKLIST_DEPLOY.md
- **Sistema Pronto**: SISTEMA_PRONTO.md

---

## ✅ Verificação Final

Após deploy, testar:
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Pacientes: listagem e cadastro
- [ ] Agendamentos: calendário e timer
- [ ] Anamnese: upload de arquivos
- [ ] Todas as páginas do menu lateral
- [ ] Health check: /api/health

**🎉 Sistema pronto para uso!**