# 🚀 Railway Deployment Guide - Sapere System

## 📋 Resumo das Alterações

O problema estava na complexidade do sistema TypeScript original que não era compatível com o ambiente de deployment do Railway. A solução implementa:

- ✅ Scripts JavaScript standalone para setup do banco
- ✅ Servidor Railway-otimizado
- ✅ Configuração simplificada de PostgreSQL
- ✅ Rate limiting e CORS adequados para produção

## 🛠️ Arquivos Criados/Modificados

### Novos Arquivos:
- `scripts-create-users.js` - Criação de tabela users
- `scripts-ensure-admin.js` - Garantir usuário admin
- `src/railway-server.ts` - Servidor otimizado para Railway
- `src/routes/auth.routes.ts` - Rotas de autenticação simplificadas
- `src/routes/health.routes.ts` - Health checks com DB

### Modificados:
- `package.json` - Novos scripts de deploy e setup

## 🚦 Passos para Deploy no Railway

### 1. Configurar Variáveis de Ambiente

No Railway Dashboard, configure as seguintes variáveis:

```bash
# Database (Railway PostgreSQL Plugin)
DB_HOST=<railway-postgres-host>
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<railway-postgres-password>

# JWT
JWT_SECRET=<seu-jwt-secret-super-seguro>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://sapere-system.vercel.app,http://localhost:5173

# Environment
NODE_ENV=production
PORT=3333
```

### 2. Configurar o Railway Build

No arquivo `railway.toml` (criar na raiz se não existir):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run setup-db && npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "always"
```

### 3. Scripts Disponíveis

```bash
# Setup completo do banco
npm run setup-db

# Scripts individuais
npm run create-tables    # Criar tabela users
npm run ensure-admin     # Criar/verificar admin

# Iniciar servidor Railway
npm run start:railway
```

### 4. Credenciais do Admin Padrão

Após o deploy, o sistema criará automaticamente:

```
📧 Email: admin@sapere.com.br
🔑 Senha: Sapere@2025
👔 Role: admin
```

⚠️ **IMPORTANTE:** Altere esta senha imediatamente após o primeiro login!

## 🔧 Endpoints Disponíveis

- `GET /` - Status da API
- `GET /api/health` - Health check básico
- `GET /api/health/db` - Health check com banco
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/test` - Teste das rotas auth

## 🐛 Troubleshooting

### Erro de Conexão com Banco:
```bash
# Verificar logs
railway logs

# Testar conexão
curl https://seu-app.railway.app/api/health/db
```

### Erro de CORS:
- Verificar se `CORS_ORIGINS` inclui seu frontend
- Confirmar protocolo (http/https)

### Erro de JWT:
- Verificar se `JWT_SECRET` está configurado
- Deve ter pelo menos 32 caracteres

## 📊 Monitoramento

O sistema inclui logging detalhado:
- Tentativas de login
- Erros de conexão
- Rate limiting
- Health checks

Monitore através dos logs do Railway:
```bash
railway logs --tail
```

## ⚡ Performance

O servidor Railway inclui:
- Trust proxy para Railway
- Rate limiting (100 req/15min geral, 5 req/15min login)
- Helmet para segurança
- CORS otimizado
- Health checks com timeout

## 🔄 Próximos Passos

1. Deploy no Railway
2. Testar endpoints
3. Configurar frontend para nova API
4. Alterar senha padrão do admin
5. Configurar monitoring/alertas

---

🎉 **Seu backend Sapere está pronto para Railway!**