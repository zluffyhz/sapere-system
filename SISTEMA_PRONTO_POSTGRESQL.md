# 🏥 SISTEMA SAPERE - BACKEND POSTGRESQL COMPLETO

## ✅ O QUE FOI IMPLEMENTADO

O backend agora está **100% funcional com PostgreSQL** e pronto para produção. Foram removidos todos os dados mock e implementadas as seguintes funcionalidades:

### 🔧 INFRAESTRUTURA
- ✅ Conexão PostgreSQL robusta (Railway, Heroku, local)
- ✅ Schema completo do banco de dados
- ✅ Sistema de autenticação JWT
- ✅ Middleware de segurança e CORS
- ✅ Rate limiting e validação

### 👥 GESTÃO DE USUÁRIOS
- ✅ Login/logout com PostgreSQL
- ✅ Criação de usuários (admin, therapist, responsible)
- ✅ Gerenciamento de perfis
- ✅ Controle de permissões por roles
- ✅ Reset de senhas

### 👤 GESTÃO DE PACIENTES
- ✅ CRUD completo de pacientes
- ✅ Busca e filtros avançados
- ✅ Campos customizados (contatos, responsáveis, convênios)
- ✅ Soft delete (desativação)
- ✅ Estatísticas por idade e tags

### 📅 SISTEMA DE AGENDAMENTOS
- ✅ CRUD completo de agendamentos
- ✅ Verificação de conflitos de horário
- ✅ Status de agendamentos (scheduled, confirmed, completed, cancelled)
- ✅ Filtros por paciente, profissional, data
- ✅ Estatísticas de agendamentos

## 🚀 CONFIGURAÇÃO RÁPIDA

### 1. INSTALAR DEPENDÊNCIAS
```bash
cd backend
npm install
```

### 2. CONFIGURAR BANCO DE DADOS

#### Opção A: PostgreSQL Local
```bash
# Instalar PostgreSQL
brew install postgresql  # macOS
# ou baixar do site oficial

# Iniciar PostgreSQL
brew services start postgresql

# Criar banco
createdb sapere_db
```

#### Opção B: Railway (Recomendado para produção)
1. Acesse [Railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione PostgreSQL
4. Copie a `DATABASE_URL`

### 3. CONFIGURAR VARIÁVEIS DE AMBIENTE

Edite o arquivo `.env.example` e renomeie para `.env`:

```env
# BANCO DE DADOS
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# OU configure individualmente:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapere_db
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui

# SERVIDOR
NODE_ENV=production
PORT=3333
```

### 4. INICIALIZAR BANCO DE DADOS
```bash
# Criar tabelas e dados iniciais
npm run init-db
```

### 5. INICIAR SERVIDOR
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔑 CREDENCIAIS PADRÃO

O sistema cria automaticamente dois usuários:

- **Admin**: `admin@sapere.com.br` / `Sapere@2025`
- **Teste**: `teste@sapere.com.br` / `Sapere@2025`

## 📊 ENDPOINTS DA API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `POST /api/auth/refresh` - Renovar token

### Usuários (Admin)
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `PUT /api/admin/users/:id` - Atualizar usuário
- `POST /api/admin/users/:id/reset-password` - Reset senha

### Pacientes
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:id` - Buscar paciente
- `POST /api/patients` - Criar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Desativar paciente
- `GET /api/patients/stats` - Estatísticas

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/:id` - Buscar agendamento
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Cancelar agendamento
- `GET /api/appointments/stats` - Estatísticas

## 🧪 TESTANDO O SISTEMA

### 1. Verificar Health Check
```bash
curl http://localhost:3333/health
```

### 2. Testar Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin@sapere.com.br",
    "password": "Sapere@2025"
  }'
```

### 3. Listar Usuários (com token)
```bash
curl -X GET http://localhost:3333/api/admin/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🏗️ ESTRUTURA DO BANCO

### Tabelas Principais
- `users` - Usuários do sistema
- `patients` - Pacientes da clínica
- `appointments` - Agendamentos
- `professionals` - Profissionais (terapeutas)
- `records` - Prontuários
- `anamnesis` - Anamneses compartilhadas

### Campos JSONB
- `contacts` - Contatos do paciente
- `responsible` - Dados do responsável
- `insurance` - Informações de convênio
- `consent` - Consentimentos LGPD

## 🚀 DEPLOY EM PRODUÇÃO

### Railway
1. Fork o repositório
2. Conecte ao Railway
3. Configure `DATABASE_URL`
4. Deploy automático

### Heroku
```bash
heroku create sapere-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### VPS/Servidor Próprio
```bash
# PM2 para gerenciamento de processos
npm install -g pm2
npm run build
pm2 start ecosystem.config.js --env production
```

## 📝 LOGS E MONITORAMENTO

- Logs estruturados com timestamps
- Tratamento robusto de erros
- Rate limiting configurado
- CORS configurado para múltiplas origens

## 🔒 SEGURANÇA

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT com expiração
- ✅ Validação de entrada
- ✅ SQL injection protection
- ✅ HTTPS ready
- ✅ Rate limiting

## 💡 PRÓXIMOS PASSOS RECOMENDADOS

1. **Configure backup automatizado** do PostgreSQL
2. **Implemente notificações** por email/WhatsApp
3. **Configure monitoramento** (New Relic, DataDog)
4. **Adicione testes automatizados**
5. **Configure CI/CD** (GitHub Actions)

---

## 🎉 SISTEMA 100% FUNCIONAL!

Seu sistema de clínica está agora completamente operacional com PostgreSQL, pronto para receber pacientes e gerenciar agendamentos na produção!

**Última atualização**: $(date)