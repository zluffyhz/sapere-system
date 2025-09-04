# 🐘 Configuração PostgreSQL - Sistema Sapere

## 📋 Visão Geral

O Sistema Sapere usa uma **estratégia híbrida de banco de dados**:

- **🛠️ Desenvolvimento**: SQLite (simples, sem dependências)
- **🚀 Produção**: PostgreSQL (escalável, robusto, multi-usuário)

---

## 🔧 Setup Local PostgreSQL (Opcional)

### macOS
```bash
# Instalar via Homebrew
brew install postgresql
brew services start postgresql

# Criar usuário e banco
createdb sapere_development
psql sapere_development -f backend/scripts/setup-postgres.sql
```

### Ubuntu/Debian
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar
sudo -u postgres psql
CREATE DATABASE sapere_development;
CREATE USER sapere_dev WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE sapere_development TO sapere_dev;
\q

# Setup inicial
cd backend
psql -U sapere_dev -d sapere_development -f scripts/setup-postgres.sql
```

### Windows
```powershell
# Baixar PostgreSQL do site oficial
# https://www.postgresql.org/download/windows/

# Após instalação, usar pgAdmin ou psql
psql -U postgres
CREATE DATABASE sapere_development;
# Seguir passos similares ao Linux
```

---

## 🌐 Configuração de Produção

### 1. VPS/Servidor Próprio

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar usuário e banco
sudo -u postgres psql
CREATE DATABASE sapere_production;
CREATE USER sapere_user WITH PASSWORD 'senha_super_segura';
GRANT ALL PRIVILEGES ON DATABASE sapere_production TO sapere_user;
ALTER USER sapere_user CREATEDB;
\q

# Configurar acesso remoto (se necessário)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Descomentar: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 2. Railway.app (Recomendado)

```bash
# 1. Criar conta no Railway.app
# 2. Adicionar PostgreSQL plugin
# 3. Copiar DATABASE_URL fornecida
# 4. Configurar no .env.production:

DATABASE_URL=postgresql://postgres:password@host:port/database
```

### 3. Heroku PostgreSQL

```bash
# 1. Instalar Heroku CLI
# 2. Adicionar addon PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Obter URL
heroku config:get DATABASE_URL

# 4. Configurar no .env.production
```

### 4. Supabase (Gratuito)

```bash
# 1. Criar projeto em supabase.com
# 2. Ir em Settings > Database
# 3. Copiar Connection String
# 4. Configurar no .env.production:

DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[REF].supabase.co:5432/postgres
```

---

## ⚙️ Configuração do Sistema

### 1. Variáveis de Ambiente

**Desenvolvimento (.env)**
```env
NODE_ENV=development
# SQLite será usado automaticamente
```

**Produção (.env.production)**
```env
NODE_ENV=production

# Opção 1: URL completa
DATABASE_URL=postgresql://user:pass@host:5432/database

# Opção 2: Configuração separada
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapere_production
DB_USER=sapere_user
DB_PASSWORD=senha_segura
```

### 2. Setup Inicial

```bash
# Backend - Setup tabelas PostgreSQL
cd backend
npm run setup:postgres

# Ou executar diretamente
psql -U sapere_user -d sapere_production -f scripts/setup-postgres.sql
```

### 3. Migração de Dados

```bash
# Migrar dados do SQLite para PostgreSQL
cd backend
npm run migrate:sqlite-to-postgres

# Ou executar diretamente
node scripts/migrate-sqlite-to-postgres.js
```

---

## 🔍 Verificação e Teste

### 1. Testar Conexão

```bash
# Teste manual da conexão
cd backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()').then(r => {
  console.log('✅ PostgreSQL conectado:', r.rows[0]);
  process.exit(0);
}).catch(e => {
  console.error('❌ Erro PostgreSQL:', e.message);
  process.exit(1);
});
"
```

### 2. Verificar Tabelas

```bash
# Listar tabelas criadas
psql -U sapere_user -d sapere_production -c "\dt"

# Verificar usuário admin
psql -U sapere_user -d sapere_production -c "SELECT email, name, role FROM users WHERE role = 'admin';"
```

### 3. Testar Aplicação

```bash
# Iniciar aplicação
cd backend
NODE_ENV=production npm start

# Verificar logs
curl http://localhost:3002/api/health
```

---

## 🛠️ Comandos Úteis

### PostgreSQL

```bash
# Status do serviço
sudo systemctl status postgresql

# Logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Backup
pg_dump -U sapere_user -d sapere_production -f backup_$(date +%Y%m%d).sql

# Restore
psql -U sapere_user -d sapere_production -f backup.sql

# Conectar via psql
psql -U sapere_user -d sapere_production

# Monitorar conexões ativas
psql -U sapere_user -d sapere_production -c "SELECT pid, usename, application_name, client_addr, state FROM pg_stat_activity WHERE datname = 'sapere_production';"
```

### Aplicação

```bash
# Forçar uso do PostgreSQL
NODE_ENV=production npm start

# Verificar qual banco está sendo usado
# (verificar logs de inicialização)

# Reset completo (cuidado!)
psql -U sapere_user -d sapere_production -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run setup:postgres
```

---

## 🆘 Solução de Problemas

### Erro: "database does not exist"
```bash
# Criar banco manualmente
sudo -u postgres psql
CREATE DATABASE sapere_production;
\q
```

### Erro: "role does not exist"
```bash
# Criar usuário manualmente
sudo -u postgres psql
CREATE USER sapere_user WITH PASSWORD 'senha';
GRANT ALL PRIVILEGES ON DATABASE sapere_production TO sapere_user;
\q
```

### Erro: "connection refused"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verificar porta
sudo netstat -tlnp | grep 5432
```

### Aplicação ainda usa SQLite
```bash
# Verificar variáveis de ambiente
echo $NODE_ENV
echo $DATABASE_URL

# Forçar PostgreSQL
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/db
npm start
```

---

## 📊 Monitoramento de Performance

### Queries Lentas
```sql
-- Ativar log de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Ver queries mais executadas
SELECT query, calls, total_time, rows, 100.0 * shared_blks_hit /
nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements ORDER BY calls DESC LIMIT 10;
```

### Uso de Espaço
```sql
-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('sapere_production'));

-- Tamanho das tabelas
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;
```

---

## ✅ Checklist de Produção

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `sapere_production` criado
- [ ] Usuário `sapere_user` com permissões
- [ ] Tabelas criadas via `setup-postgres.sql`
- [ ] Usuário admin existe (`admin@sapere.com.br`)
- [ ] Variáveis de ambiente configuradas
- [ ] Conexão testada e funcionando
- [ ] Aplicação iniciada com PostgreSQL
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

**🎉 PostgreSQL configurado e pronto para produção!**

Para mais informações, consulte:
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Railway.app PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Supabase Database](https://supabase.com/docs/guides/database)