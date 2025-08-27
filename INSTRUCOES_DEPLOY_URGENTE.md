# 🚀 INSTRUÇÕES URGENTES DE DEPLOY - SAPERE SYSTEM

## ✅ CORREÇÕES JÁ APLICADAS NO CÓDIGO:

1. **vercel.json** criado ✅
2. **vite.config.ts** corrigido ✅  
3. **package.json** type module ✅
4. **favicon corrigido** ✅
5. **Build testado localmente** ✅

---

## 🔥 DEPLOY IMEDIATO - EXECUTE AGORA:

### **PASSO 1: Commit das correções**
```bash
git add .
git commit -m "fix: corrigir SPA routing e configurações de build

🛠️ Correções aplicadas:
- Adicionar vercel.json para SPA routing
- Corrigir vite.config.ts (historyApiFallback, base)
- Adicionar type: module ao package.json
- Corrigir favicon reference (vite.svg → logo-sapere)
- Build testado e funcionando

🎯 Resolve: 404 em todas as rotas, warnings PostCSS"
```

### **PASSO 2: Push e Deploy**
```bash
git push origin main
```

O Vercel vai fazer deploy automático. **Aguarde 2-3 minutos** e teste!

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY:

### **Teste estas URLs:**
- ✅ https://sapere-system.vercel.app (deve carregar login)
- ✅ https://sapere-system.vercel.app/dashboard (deve redirecionar para login)
- ✅ https://sapere-system.vercel.app/patients (deve redirecionar para login)

### **Verificar se resolvido:**
- [ ] Sem mais 404s nas rotas
- [ ] Favicon carrega (não mais vite.svg 404)  
- [ ] SPA routing funciona
- [ ] Sem warnings PostCSS

---

## ⚠️ AINDA PRECISAM SER RESOLVIDOS:

### **1. PROBLEMA DE AUTENTICAÇÃO** 🔴
**Sintoma:** Login retorna 401 Unauthorized  
**Causa:** Credenciais não existem no banco Railway

**SOLUÇÃO:**
```bash
# 1. Conectar no Railway
railway login
railway link

# 2. Verificar banco de dados
railway run psql $DATABASE_URL

# 3. No psql, verificar usuários:
\c sapere_db;
SELECT * FROM users WHERE email = 'admin@sapere.com';

# 4. Se não existir, criar usuário:
INSERT INTO users (email, password, name, role, status) 
VALUES ('admin@sapere.com', '$2b$10$hash_da_senha', 'Admin', 'admin', 'active');
```

### **2. RESET DOS USUÁRIOS DE TESTE**
```bash
# Execute no backend:
cd backend
npm run ensure-admin
```

### **3. VERIFICAR API BACKEND**
```bash
# Testar health:
curl https://sapere-system-production.up.railway.app/api/health

# Testar login:
curl -X POST https://sapere-system-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sapere.com","password":"admin123"}'
```

---

## 🎯 ORDEM DE EXECUÇÃO:

1. **AGORA:** Faça o commit e push (5 min)
2. **AGUARDE:** Deploy do Vercel (2-3 min)  
3. **TESTE:** URLs das rotas (1 min)
4. **SE ROUTING OK:** Resolver autenticação (10-15 min)
5. **TESTE FINAL:** Login completo (2 min)

---

## 📊 PROGRESSO ESPERADO:

### **Após Step 1 (Deploy):**
- ✅ Rotas param de dar 404
- ✅ SPA routing funciona  
- ❌ Login ainda falha (401)

### **Após Step 2 (Fix Auth):**
- ✅ Login funciona
- ✅ Sistema 100% operacional
- ✅ Todas as funcionalidades acessíveis

---

## 🆘 SE ALGO DER ERRADO:

### **Deploy falhou?**
```bash
# Ver logs do Vercel:
vercel logs sapere-system --follow

# Ou rebuild manual:
vercel --prod
```

### **Routing ainda 404?**
- Verifique se vercel.json foi commitado
- Confirme se está na raiz do projeto
- Aguarde cache do Vercel limpar (5-10 min)

### **Auth ainda falha?**
- Confirme credenciais no banco Railway
- Execute script ensure-admin no backend
- Verifique logs da API Railway

---

## ✅ CHECKLIST FINAL:

- [ ] Commit & push feito
- [ ] Deploy Vercel concluído  
- [ ] Routing 404s resolvidos
- [ ] Favicon carregando
- [ ] Login testado (admin@sapere.com)
- [ ] Dashboard acessível após login
- [ ] Todas as seções funcionando

**🎯 META: Sistema 100% operacional em 30 minutos!**