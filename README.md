# Sistema Sapere 🧠💙

Sistema de gestão completo para a clínica de neurodivergentes Sapere, desenvolvido com React.js, Node.js e PostgreSQL.

## 🎨 Cores Oficiais Sapere

- **Laranja Principal**: `#F97316`
- **Amarelo Dourado**: `#FCD34D`
- **Marrom Escuro**: `#92400E`
- **Branco**: `#FFFFFF`
- **Cinza Claro**: `#F3F4F6`
- **Verde WhatsApp**: `#25D366`

## 🚀 Tecnologias

### Frontend
- React.js 18
- TypeScript
- Tailwind CSS (configurado com cores Sapere)
- React Router Dom
- React Hook Form
- Axios
- Lucide React (ícones)

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (autenticação)
- bcryptjs (criptografia de senhas)

## 📁 Estrutura do Projeto

```
sapere-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── context/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de configuração:
```bash
cp .env.example .env
```

4. Configure as variáveis no arquivo `.env`:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapere_db
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

5. Execute as migrações do banco:
```bash
npm run migrate
```

6. Inicie o servidor:
```bash
npm run dev
```

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de configuração:
```bash
cp .env.example .env
```

4. Configure a URL da API no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🗄️ Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- **users**: Usuários do sistema
- **patients**: Pacientes da clínica
- **professionals**: Profissionais/terapeutas
- **appointments**: Agendamentos

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. As rotas protegidas requerem o token no header:
```
Authorization: Bearer <token>
```

## 🎯 Funcionalidades Implementadas

✅ **Autenticação JWT**
- Login/logout
- Proteção de rotas
- Gerenciamento de sessão

✅ **Interface Base**
- Layout responsivo
- Sidebar de navegação
- Dashboard com estatísticas
- Cores e estilos Sapere

✅ **Estrutura Backend**
- API REST
- Conexão PostgreSQL
- Middlewares de segurança
- Validação de dados

## 📋 Próximos Passos

- [ ] CRUD de Pacientes
- [ ] CRUD de Profissionais
- [ ] Sistema de Agendamentos
- [ ] Relatórios e estatísticas
- [ ] Notificações
- [ ] Backup e restore
- [ ] Testes automatizados

## 🤝 Contribuição

Este é um projeto específico para a clínica Sapere. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Todos os direitos reservados - Clínica Sapere 2024