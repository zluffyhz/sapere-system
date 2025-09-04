# 🚀 Guia Completo de Deploy - Sapere System

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Conta no Railway
- Conta no Vercel

## 🔧 Configuração Local (Teste)

### 1. Clone e Configuração Inicial

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sapere-system.git
cd sapere-system

# Vá para o diretório do projeto reformulado
cd sapere
```

### 2. Configurar Backend

```bash
# Navegue para o backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Configure seu .env:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sapere_db"
JWT_SECRET="sua-chave-secreta-super-forte-aqui-2024"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Banco de Dados Local

```bash
# Se você tem PostgreSQL instalado localmente:
createdb sapere_db

# Ou use Docker:
docker run --name sapere-postgres \
  -e POSTGRES_USER=sapere \
  -e POSTGRES_PASSWORD=sapere123 \
  -e POSTGRES_DB=sapere_db \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Inicializar Banco de Dados

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma db push

# Popule o banco com dados de demonstração
npm run prisma:seed

# Inicie o backend
npm run dev
```

### 5. Configurar Frontend

```bash
# Em outro terminal, vá para o frontend
cd ../frontend

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Edite o arquivo .env.local
nano .env.local
```

**Configure seu .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME="Sapere Psychology Clinic"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NODE_ENV=development
```

```bash
# Inicie o frontend
npm run dev
```

### 6. Teste Local

Acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **Prisma Studio**: `npx prisma studio` (no diretório backend)

**Contas de Teste Criadas:**
- **Admin**: `admin@sapere.com` / `sapere2025`
- **Dono de Clínica**: `clinica@sapere.com` / `clinic123`
- **Psicólogo**: `psicologo@sapere.com` / `psi123`
- **Cliente**: `cliente@sapere.com` / `client123`

## 🚂 Deploy no Railway (Backend)

### 1. Criar Projeto no Railway

```bash
# Instale Railway CLI
npm install -g @railway/cli

# Faça login
railway login

# No diretório do backend, inicie o projeto
cd sapere/backend
railway init

# Escolha "Deploy from GitHub repo" ou "Empty project"
```

### 2. Configurar PostgreSQL

No dashboard do Railway:
1. Clique em "Add Service" → "Database" → "PostgreSQL"
2. Aguarde a criação
3. Copie a URL de conexão gerada

### 3. Configurar Variáveis de Ambiente

No Railway Dashboard → Seu projeto → Variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=sua-chave-secreta-super-forte-para-producao-2024
NODE_ENV=production
PORT=$PORT
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 4. Deploy do Backend

```bash
# No diretório backend
railway up
```

Ou configure deploy automático via GitHub:
1. Conecte seu repositório GitHub no Railway
2. Configure o "Root Directory" como `sapere/backend`
3. O deploy será automático a cada push

### 5. Executar Seed no Banco de Produção

```bash
# Conecte ao projeto Railway
railway link

# Execute o seed
railway run npm run prisma:seed
```

## 🔺 Deploy no Vercel (Frontend)

### 1. Preparar para Deploy

No diretório `sapere/frontend`, edite o `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://seu-backend.up.railway.app/api",
    "NEXT_PUBLIC_APP_NAME": "Sapere Psychology Clinic",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0"
  }
}
```

### 2. Deploy no Vercel

```bash
# Instale Vercel CLI
npm install -g vercel

# No diretório frontend
cd sapere/frontend
vercel

# Siga as instruções
# Project name: sapere-frontend
# Directory: ./
# Override settings: No
```

Ou via Dashboard Vercel:
1. Conecte seu repositório GitHub
2. Configure "Root Directory" como `sapere/frontend`
3. Configure as variáveis de ambiente

### 3. Configurar Variáveis de Ambiente no Vercel

No Vercel Dashboard → Seu projeto → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app/api
NEXT_PUBLIC_APP_NAME=Sapere Psychology Clinic
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

## 🔄 Atualizar CORS do Backend

Após deploy do frontend, atualize o backend:

```typescript
// backend/index.ts
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://seu-projeto.vercel.app', // Sua URL do Vercel
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ].filter(Boolean),
  // ... resto da configuração
};
```

## 🐛 Troubleshooting

### Backend não conecta com banco

```bash
# Verifique a conexão
railway run npx prisma db push

# Verifique logs
railway logs
```

### Frontend não consegue acessar API

1. Verifique se `NEXT_PUBLIC_API_URL` está correto
2. Verifique CORS no backend
3. Teste a API diretamente: `https://seu-backend.up.railway.app/health`

### Erro de CORS

Atualize as URLs permitidas no `backend/index.ts`:

```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://seu-frontend.vercel.app',
    // Adicione suas URLs
  ],
  credentials: true
};
```

## 📊 Verificação de Deploy

### Checklist Backend (Railway)
- [ ] ✅ API responde: `https://seu-backend.up.railway.app/health`
- [ ] ✅ Status 200 com "database: Connected"
- [ ] ✅ Auth funciona: POST para `/api/auth/login`
- [ ] ✅ CORS configurado para seu frontend

### Checklist Frontend (Vercel)
- [ ] ✅ Site carrega: `https://seu-frontend.vercel.app`
- [ ] ✅ Login funciona com contas de teste
- [ ] ✅ API calls funcionam (verificar Network tab)
- [ ] ✅ Redirecionamentos funcionam após login

## 🎯 Próximos Passos

Após o deploy básico funcionar:

1. **Configurar domínio personalizado** (opcional)
2. **Configurar monitoramento** (logs, métricas)
3. **Configurar backup do banco** (Railway tem backup automático)
4. **Implementar CI/CD** (GitHub Actions)
5. **Configurar SSL** (automático no Vercel/Railway)

## 🛡️ Segurança

- ✅ JWT_SECRET forte e único para produção
- ✅ CORS configurado adequadamente
- ✅ Variáveis sensíveis em variáveis de ambiente
- ✅ HTTPS forçado em produção
- ✅ Headers de segurança configurados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway: `railway logs`
2. Verifique os logs no Vercel: Dashboard → Functions → View Logs
3. Teste as APIs diretamente com Postman/Insomnia
4. Verifique se todas as variáveis de ambiente estão configuradas

---

**🎉 Parabéns! Seu sistema Sapere está online!**

Acesse com as contas padrão criadas no seed para começar a testar todas as funcionalidades.