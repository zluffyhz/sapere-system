# 🗄️ Banco de Dados Sapere

Sistema de banco de dados PostgreSQL completo para a clínica de neurodivergentes Sapere, baseado no modelo iClinic.

## 📋 Estrutura das Tabelas

### 👥 **1. users**
Gerenciamento de usuários do sistema (admin, terapeutas, responsáveis)
- **Campos principais**: email, password, name, role, status, phone, cpf
- **Relacionamentos**: Referenciado por therapists, patients, appointments, records

### 🧠 **2. therapists** 
Profissionais especializados da clínica
- **Campos principais**: professional_id (CRP), specialties, available_hours, consultation_duration
- **Relacionamentos**: user_id → users

### 👶 **3. patients**
Pacientes da clínica com informações completas
- **Campos principais**: name, birth_date, diagnosis, medications, allergies, school_info
- **Relacionamentos**: responsible_users → users[], emergency_contacts

### 📅 **4. appointments**
Sistema completo de agendamentos
- **Campos principais**: appointment_date, status, confirmed_by_patient, session_number
- **Relacionamentos**: patient_id → patients, therapist_id → therapists
- **Status**: scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled

### 📝 **5. records**
Prontuários eletrônicos e evoluções
- **Campos principais**: record_type, content, goals, interventions, mood, attention_level
- **Tipos**: initial_assessment, evolution, discharge, intercurrence, family_guidance
- **Relacionamentos**: patient_id → patients, therapist_id → therapists, appointment_id → appointments

### 📎 **6. record_attachments**
Anexos para prontuários (documentos, imagens, vídeos, áudios, relatórios)
- **Relacionamentos**: record_id → records

### 💬 **7. communications**
Log de comunicações (SMS/Email/WhatsApp)
- **Campos principais**: type, status, message, to_phone, to_email, sent_at
- **Relacionamentos**: patient_id → patients, appointment_id → appointments

### ⚙️ **8. clinic_settings**
Configurações gerais da clínica
- **Informações**: nome, contatos, horários, configurações de agendamento
- **Contatos Sapere**: 
  - WhatsApp: +55 92 99230-5850
  - Email: Sapere.recepcao@gmail.com

### 📊 **9. activity_logs**
Log de atividades para auditoria
- **Campos principais**: action, resource_type, old_values, new_values, ip_address

## 🚀 Como Usar

### 1. **Setup Automático**
```bash
cd database
bash setup.sh
```

### 2. **Setup Manual**
```bash
# Criar banco
createdb sapere_db

# Aplicar schema
psql -d sapere_db -f schema.sql

# Criar índices  
psql -d sapere_db -f indexes.sql

# Inserir dados exemplo (opcional)
psql -d sapere_db -f seeds.sql
```

### 3. **Via Backend**
```bash
cd backend
npm run migrate
```

## 👤 Usuários de Teste Criados

| Email | Senha | Função | Especialidade |
|-------|--------|--------|--------------|
| admin@sapere.com.br | admin123 | Admin | Administração |
| dra.maria@sapere.com.br | admin123 | Terapeuta | TEA, ABA |
| dr.joao@sapere.com.br | admin123 | Terapeuta | T.O., Integração Sensorial |
| dra.ana@sapere.com.br | admin123 | Terapeuta | Fonoaudiologia |

## 🔍 Índices de Performance

- **Busca textual**: Pacientes e prontuários
- **Consultas temporais**: Agendamentos por data/período  
- **Relatórios**: Dashboard e estatísticas
- **Comunicações**: Logs por paciente e tipo
- **Auditoria**: Atividades por usuário e recurso

## 🛡️ Características de Segurança

- **UUIDs**: Para todos os IDs principais
- **ENUM types**: Para campos com valores controlados
- **Índices parciais**: Apenas registros ativos/relevantes
- **Versionamento**: Para prontuários
- **Log de auditoria**: Para todas as ações importantes

## 📈 Dados de Exemplo

- **4 Pacientes**: Gabriel (TEA), Sofia (ADHD), Lucas (Asperger), Beatriz (AGD)
- **3 Terapeutas**: Especialistas em diferentes áreas
- **5 Agendamentos**: Passados e futuros
- **2 Prontuários**: Avaliação inicial e evolução
- **2 Comunicações**: WhatsApp e email

## 🔧 Configurações da Clínica

- **Horário funcionamento**: Seg-Sex 8h-18h, Sáb 8h-12h
- **Duração consulta**: 60 minutos (padrão)
- **Antecedência mínima**: 24 horas
- **Lembretes**: 24h e 2h antes
- **Canais**: WhatsApp, SMS, Email

## 📞 Contatos Configurados

- **WhatsApp**: +55 92 99230-5850
- **Email**: Sapere.recepcao@gmail.com
- **Endereço**: Manaus/AM (configurável)

---

**⚠️ IMPORTANTE**: Este banco foi projetado EXCLUSIVAMENTE para gestão clínica. **NÃO** possui módulos financeiros, pagamentos ou faturamento, focando apenas no cuidado e acompanhamento dos pacientes neurodivergentes.