# 🏥 Sistema Sapere - Gestão Clínica

Sistema completo de gestão para clínicas especializadas em neurodivergência, desenvolvido em Django.

## 🚀 Funcionalidades

### 👥 Gestão de Pacientes
- Cadastro completo de pacientes neurodivergentes
- Informações médicas e de contato
- Dados do responsável (para menores de idade)
- Histórico médico e medicações

### 📅 Sistema de Agendamentos
- Agendamento de consultas e sessões
- Controle de status (agendado, confirmado, cancelado)
- Integração com dados do paciente

### 📋 Anamneses
- Upload de documentos (PDF, Word)
- Prontuários organizados por paciente
- Sistema de arquivos seguro

### ⏱️ Timer de Sessões
- Cronômetro para sessões terapêuticas
- Anotações em tempo real
- Histórico de sessões

### 📊 Dashboard
- Estatísticas da clínica
- Métricas em tempo real
- Ações rápidas
- Atividades recentes

## 🛠️ Tecnologias

- **Backend**: Django 4.2
- **Banco de Dados**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Deploy**: Railway/Heroku compatível
- **Servidor**: Gunicorn + WhiteNoise

## 📦 Instalação Local

### Pré-requisitos
- Python 3.11+
- PostgreSQL
- Git

### Setup
```bash
# Clone o repositório
git clone https://github.com/zluffyhz/sapere-system.git
cd sapere-system

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações
python manage.py migrate

# Crie um superusuário
python manage.py createsuperuser

# Inicie o servidor
python manage.py runserver
```

## 🌐 Deploy

### Railway
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`: URL do PostgreSQL
   - `SECRET_KEY`: Chave secreta do Django
   - `DEBUG`: False (para produção)
3. Deploy automático será executado

### Variáveis de Ambiente
```env
SECRET_KEY=sua_chave_secreta_aqui
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/database
ALLOWED_HOSTS=localhost,127.0.0.1,*.railway.app
```

## 👤 Credenciais Padrão

```
Usuário: admin
Senha: sapere2025
```

## 📁 Estrutura do Projeto

```
sapere/
├── apps/
│   ├── core/           # Funcionalidades base
│   ├── authentication/ # Sistema de login
│   ├── patients/       # Gestão de pacientes
│   ├── appointments/   # Agendamentos
│   ├── anamnesis/      # Prontuários
│   ├── sessions/       # Timer de sessões
│   ├── dashboard/      # Painel principal
│   └── reports/        # Relatórios
├── templates/          # Templates HTML
├── static/            # Arquivos estáticos
└── settings.py        # Configurações Django
```

## 🎨 Interface

- Design responsivo com Bootstrap 5
- Cores da marca Sapere (laranja/amarelo)
- Ícones Bootstrap Icons
- JavaScript customizado para UX

## 📄 Licença

Este projeto foi desenvolvido para uso específico da Clínica Sapere.

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato através do repositório GitHub.

---

**Sistema Sapere** - Gestão especializada para neurodivergência 🧠✨