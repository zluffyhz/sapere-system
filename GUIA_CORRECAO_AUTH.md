# 🔑 GUIA COMPLETO - CORREÇÃO DA AUTENTICAÇÃO

## 🎯 PROBLEMA IDENTIFICADO:
- API retorna **401 Unauthorized**
- Credenciais `admin@sapere.com / admin123` rejeitadas
- Usuários não existem no banco de produção

---

## 🔍 DIAGNÓSTICO DO BACKEND

### **1. Verificar Status da API:**
```bash
curl https://sapere-system-production.up.railway.app/api/health
```
**Esperado:** Status 200 com dados de health

### **2. Verificar Banco de Dados Railway:**
```bash
# Conectar no Railway CLI:
railway login
railway link sapere-system-production

# Acessar banco:
railway run psql $DATABASE_URL

# No PostgreSQL:
\c sapere_db;
\dt;  # listar tabelas
SELECT * FROM users;  # ver usuários existentes
```

### **3. Verificar Estrutura da Tabela Users:**
```sql
\d users;  # mostrar estrutura da tabela

-- Deve ter colunas:
-- id, email, password, name, role, status, created_at, updated_at
```

---

## 🛠️ SOLUÇÕES PARA AUTENTICAÇÃO

### **SOLUÇÃO 1: Executar Script Ensure-Admin**
```bash
# No diretório backend:
cd backend

# Executar script via Railway:
railway run node scripts-ensure-admin.js

# OU diretamente no servidor:
railway run npm run ensure-admin
```

### **SOLUÇÃO 2: Criar Usuários Manualmente**
```sql
-- No psql do Railway:
INSERT INTO users (email, password, name, role, status, created_at, updated_at) 
VALUES (
  'admin@sapere.com', 
  '$2b$10$Xl8XQoXZGHGpCJF5A5Ke5.mHXJ8t9K9ZJz9jJ9XmP3w9GrNhQ5TkS', -- admin123 hash
  'Administrador Sapere', 
  'admin', 
  'active',
  NOW(),
  NOW()
);

-- Criar outros usuários de teste:
INSERT INTO users (email, password, name, role, status, created_at, updated_at) VALUES
('psi@sapere.com', '$2b$10$Xl8XQoXZGHGpCJF5A5Ke5.mHXJ8t9K9ZJz9jJ9XmP3w9GrNhQ5TkS', 'Dra. Maria Silva', 'therapist', 'active', NOW(), NOW()),
('fono@sapere.com', '$2b$10$Xl8XQoXZGHGpCJF5A5Ke5.mHXJ8t9K9ZJz9jJ9XmP3w9GrNhQ5TkS', 'Dr. João Santos', 'therapist', 'active', NOW(), NOW()),
('to@sapere.com', '$2b$10$Xl8XQoXZGHGpCJF5A5Ke5.mHXJ8t9K9ZJz9jJ9XmP3w9GrNhQ5TkS', 'Dra. Ana Costa', 'therapist', 'active', NOW(), NOW());
```

### **SOLUÇÃO 3: Recriar Hash de Senha**
```javascript
// Criar novo hash no Node.js:
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash); // usar este hash no INSERT
```

---

## 🧪 TESTES DA API

### **1. Testar Login após correção:**
```bash
curl -X POST https://sapere-system-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sapere.com",
    "password": "admin123"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "email": "admin@sapere.com",
    "name": "Administrador Sapere",
    "role": "admin"
  }
}
```

### **2. Testar Token:**
```bash
# Usar token do response anterior:
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://sapere-system-production.up.railway.app/api/users/me
```

---

## 🔄 MIGRAÇÃO DE DADOS (se necessário)

### **1. Verificar Se Precisa Migrar:**
```bash
cd backend
railway run npm run migrate
```

### **2. Setup Completo do Banco:**
```bash
# Executar todos os scripts de setup:
railway run npm run setup-db
```

### **3. Verificar Estrutura Final:**
```sql
-- No psql:
\d users;
SELECT COUNT(*) FROM users;
SELECT email, name, role, status FROM users;
```

---

## 📊 LOGS DE DEBUG

### **1. Verificar Logs do Backend:**
```bash
railway logs --tail
```

### **2. Verificar Variáveis de Ambiente:**
```bash
railway variables
```

**Deve ter:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`

### **3. Debug Local do Backend:**
```bash
cd backend
npm run dev

# Em outro terminal:
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sapere.com","password":"admin123"}'
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### **Backend/Banco:**
- [ ] Railway connection funcionando
- [ ] Banco PostgreSQL acessível  
- [ ] Tabela `users` existe
- [ ] Usuário admin@sapere.com existe
- [ ] Password hash está correto
- [ ] Migrações aplicadas

### **API:**
- [ ] /api/health retorna 200
- [ ] /api/auth/login aceita credenciais
- [ ] JWT token é gerado
- [ ] Token é válido para outras rotas

### **Frontend:**
- [ ] Login form envia dados corretos
- [ ] API response é tratada
- [ ] Token é salvo no localStorage
- [ ] Redirect após login funciona

---

## 🆘 TROUBLESHOOTING

### **Erro "relation users does not exist":**
```bash
railway run npm run migrate
# ou criar tabela manualmente
```

### **Erro "password hash invalid":**
```javascript
// Gerar novo hash:
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123', 10));
```

### **Erro "JWT secret missing":**
```bash
railway variables set JWT_SECRET="sua_chave_secreta_aqui"
railway deploy
```

### **Backend não responde:**
```bash
railway status
railway restart
railway logs --tail
```

---

## 🎯 RESULTADO ESPERADO:

Após aplicar as correções:
- ✅ Login admin@sapere.com funciona
- ✅ JWT token gerado corretamente  
- ✅ Redirect para dashboard
- ✅ Sistema 100% funcional
- ✅ Todos os usuários de teste ativos

**Tempo estimado:** 15-30 minutos