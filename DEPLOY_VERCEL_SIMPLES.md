# DEPLOY VERCEL SIMPLIFICADO

## SISTEMA SIMPLIFICADO PARA VERCEL

O código foi drasticamente simplificado para garantir deploy sem falhas no Vercel:

### MUDANÇAS REALIZADAS:

1. **Backend Unificado**: Um único arquivo `vercel-simple.ts` com toda a lógica
2. **Sem Imports Complexos**: Removidas dependências problemáticas
3. **Database Simples**: Conexão direta PostgreSQL sem layers extras
4. **Schema Minimal**: Tabelas essenciais apenas
5. **Routes Inline**: Todas as rotas no mesmo arquivo
6. **Error Handling Básico**: Tratamento simples de erros

### ARQUIVOS PRINCIPAIS:

- `backend/src/vercel-simple.ts` - Servidor completo
- `backend/schema-simple.sql` - Schema mínimo
- `backend/init-simple.js` - Inicialização do banco
- `vercel.json` - Configuração Vercel atualizada

### FUNCIONALIDADES MANTIDAS:

- Login/Auth JWT
- CRUD Pacientes
- CRUD Agendamentos
- Gerenciamento Usuários
- PostgreSQL completo

### PARA FAZER DEPLOY:

1. **Configure variáveis no Vercel:**
   - `DATABASE_URL` - URL do PostgreSQL
   - `JWT_SECRET` - Chave secreta
   - `NODE_ENV` - production

2. **Inicialize banco:**
   ```bash
   npm run init-db
   ```

3. **Deploy automático via Git**

### CREDENCIAIS PADRÃO:
- Admin: `admin@sapere.com.br` / `Sapere@2025`
- Teste: `teste@sapere.com.br` / `Sapere@2025`

### ENDPOINTS PRINCIPAIS:
- `POST /api/auth/login`
- `GET /api/admin/users`
- `GET /api/patients`
- `GET /api/appointments`

**Sistema agora com máxima compatibilidade Vercel!**