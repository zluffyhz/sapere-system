# ✅ Checklist de Deploy - Sistema Sapere

## 📋 Pré-Deploy (Local)

### Verificações de Código:
- [ ] Todos os tipos TypeScript estão corretos
- [ ] Linter está passando sem erros
- [ ] Builds local funcionando (frontend + backend)
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets não commitados no código
- [ ] Logs de debug removidos

### Testes Funcionais:
- [ ] Login/logout funcionando
- [ ] Criação de usuários
- [ ] CRUD de anamneses
- [ ] APIs respondendo corretamente
- [ ] WebSocket funcionando (se aplicável)

## 🖥️ Configuração da VPS

### Requisitos do Sistema:
- [ ] Ubuntu/CentOS atualizado
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado e configurado
- [ ] Firewall configurado (22, 80, 443)
- [ ] SSL certificado configurado (Let's Encrypt)

### Estrutura de Diretórios:
```bash
/var/www/sapere/
├── backend/
├── frontend/
├── logs/
├── uploads/
└── backups/
```

### Permissões:
- [ ] Diretórios com permissão 755
- [ ] Arquivos com permissão 644
- [ ] Uploads/backups com permissão de escrita
- [ ] Proprietário www-data configurado

## 🚀 Deploy

### Método Automático (Recomendado):
```bash
# Configurar no script deploy.sh:
VPS_HOST="seu-ip-ou-dominio"
VPS_USER="root"

# Executar:
./deploy.sh production
```

### Verificações Pós-Deploy:
- [ ] PM2 status: aplicação rodando
- [ ] Health check respondendo: `/health`
- [ ] Nginx status: ativo e configurado
- [ ] SSL funcionando: https://
- [ ] API funcionando: `GET /api/health`
- [ ] Frontend carregando corretamente

## 🔧 Configuração de Ambiente

### Arquivo .env (Backend):
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` forte (32+ chars)
- [ ] `CORS_ORIGINS` com domínios corretos
- [ ] Configurações de banco (se PostgreSQL)
- [ ] Configurações de email (se necessário)

### Nginx:
- [ ] Proxy reverso para API (`/api/`)
- [ ] Servir frontend estático (`/`)
- [ ] WebSocket proxy (`/socket.io/`)
- [ ] Headers de segurança
- [ ] Gzip/compressão habilitada

## 📊 Monitoramento

### PM2:
- [ ] Aplicação iniciando automaticamente
- [ ] Logs sendo gravados corretamente
- [ ] Restart automático em caso de falha
- [ ] Monitoramento de CPU/memória

### Sistema:
- [ ] Logs do sistema (/var/log/)
- [ ] Espaço em disco suficiente
- [ ] Memória RAM adequada (2GB+ recom.)
- [ ] CPU não sobrecarregada

## 🔒 Segurança

### Configurações:
- [ ] Rate limiting configurado
- [ ] Headers de segurança (Helmet)
- [ ] HTTPS forçado
- [ ] Validação de entrada rigorosa
- [ ] Logs de auditoria

### Credenciais:
- [ ] Senha padrão alterada
- [ ] Usuários de teste removidos (produção)
- [ ] Backups em local seguro
- [ ] Monitoramento de acesso

## 🧪 Testes Pós-Deploy

### Funcionalidade:
- [ ] Login com usuário admin
- [ ] Criação de novos usuários
- [ ] CRUD de anamneses funcionando
- [ ] Upload de arquivos
- [ ] Geração de relatórios
- [ ] Responsividade mobile

### Performance:
- [ ] Tempo de carregamento < 3s
- [ ] APIs respondendo < 500ms
- [ ] Compressão de assets ativa
- [ ] Cache funcionando

### Compatibilidade:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS/Android)

## 📞 Usuários Finais

### Treinamento:
- [ ] Usuários treinados no sistema
- [ ] Documentação de uso fornecida
- [ ] Suporte inicial configurado
- [ ] Backup/recuperação de dados explicado

### Acesso:
- [ ] URLs finais compartilhadas
- [ ] Credenciais de acesso fornecidas
- [ ] Procedimentos de reset de senha
- [ ] Contato para suporte técnico

## 🆘 Plano de Contingência

### Problemas Comuns:
- [ ] Aplicação não inicia → Verificar logs PM2
- [ ] 502 Bad Gateway → Verificar Nginx + backend
- [ ] SSL não funciona → Verificar certificados
- [ ] Performance lenta → Verificar recursos

### Rollback:
- [ ] Versão anterior disponível
- [ ] Backup do banco de dados
- [ ] Procedimento de rollback documentado
- [ ] Plano de comunicação com usuários

## ✅ Deploy Finalizado

Quando todos os itens estiverem ✅:

🎉 **Sistema Sapere está pronto para produção!**

### Informações Finais:
- **URL**: https://seu-dominio.com
- **Admin**: admin@sapere.com.br
- **Suporte**: Sapere.recepcao@gmail.com
- **WhatsApp**: (92) 99230-5850

### Próximos Passos:
1. Monitorar primeiros dias de uso
2. Coletar feedback dos usuários
3. Ajustes finos se necessário
4. Planejar melhorias futuras

---
**Data do Deploy**: ___________  
**Responsável**: ___________  
**Status**: [ ] Concluído com sucesso