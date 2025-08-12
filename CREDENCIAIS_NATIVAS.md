# 🔑 Credenciais Nativas do Sistema Sapere

Este arquivo contém as credenciais de usuários que são criados automaticamente quando o sistema é inicializado.

## 👨‍💼 **Administradores**

### Administrador Principal
| Campo | Valor |
|-------|-------|
| **Email** | `admin@sapere.com.br` |
| **Senha** | `Sapere@2025` |
| **Nome** | Administrador Sapere |
| **Papel** | Administrador |
| **Telefone** | (92) 99230-5850 |

### Recepção (Admin)
| Campo | Valor |
|-------|-------|
| **Email** | `recepcao@sapere.com.br` |
| **Senha** | `Recepcao@123` |
| **Nome** | Recepção Sapere |
| **Papel** | Administrador |
| **Telefone** | (92) 99230-5850 |

**Permissões**: Acesso total ao sistema, pode cadastrar/gerenciar terapeutas, alterar configurações, gerenciar agendamentos.

---

## 👩‍⚕️ **Terapeutas**

### Dra. Maria Silva
| Campo | Valor |
|-------|-------|
| **Email** | `dra.maria@sapere.com.br` |
| **Senha** | `Terapia@123` |
| **Nome** | Dra. Maria Silva |
| **Papel** | Terapeuta |
| **Telefone** | (92) 98888-8888 |
| **Registro** | CRP 20/12345 |
| **Especialidades** | Psicologia Clínica, Neuropsicologia, TDAH |
| **Experiência** | 10 anos |

### Dr. Carlos Santos
| Campo | Valor |
|-------|-------|
| **Email** | `dr.carlos@sapere.com.br` |
| **Senha** | `Psico@2025` |
| **Nome** | Dr. Carlos Santos |
| **Papel** | Terapeuta |
| **Telefone** | (92) 97777-7777 |
| **Registro** | CRP 20/67890 |
| **Especialidades** | Psicologia Infantil, TEA, Análise Comportamental |
| **Experiência** | 8 anos |


---

## 🔧 **Como Personalizar**

Para adicionar novos usuários nativos ou alterar senhas, edite o arquivo:
```
backend/src/database/config/database.ts
```

Localize a seção "USUÁRIOS NATIVOS DO SISTEMA" (linha ~320) e:

1. **Adicionar novo usuário**:
```javascript
{
  id: '5',
  email: 'novo.usuario@sapere.com.br',
  password: 'SenhaSegurae123',
  name: 'Nome do Usuário',
  role: 'therapist', // ou 'admin'
  phone: '(92) 99999-9999'
}
```

2. **Adicionar perfil de terapeuta** (se role = 'therapist'):
```javascript
{
  id: '5',
  user_id: '5',
  professional_id: 'CRP XX/XXXXX',
  specialties: ['Especialidade 1', 'Especialidade 2'],
  bio: 'Descrição do profissional...',
  experience_years: 5,
  languages: ['Português']
}
```

3. **Reiniciar o sistema** para aplicar as mudanças.

---

## ⚠️ **Importante - Segurança**

- **SEMPRE altere as senhas padrão em produção**
- Use senhas com pelo menos 8 caracteres
- Combine maiúsculas, minúsculas, números e símbolos
- Considere usar um gerenciador de senhas
- Mantenha este arquivo seguro e não o compartilhe publicamente

---

## 🚀 **Primeira Configuração**

1. Faça login com o administrador
2. Altere a senha do admin em: **Perfil → Alterar Senha**
3. Configure os dados da clínica
4. Altere as senhas dos outros usuários conforme necessário
5. Cadastre novos terapeutas se necessário

---

## 📝 **Histórico de Versões**

| Data | Versão | Alterações |
|------|--------|------------|
| 2025-01-12 | 1.0 | Credenciais iniciais criadas |