-- Sistema Sapere - Schema do Banco de Dados PostgreSQL
-- Baseado no modelo iClinic para clínica de neurodivergentes
-- Sem módulos financeiros

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "RecordEntry" CASCADE;
DROP TABLE IF EXISTS "Appointment" CASCADE;
DROP TABLE IF EXISTS "Professional" CASCADE;
DROP TABLE IF EXISTS "Patient" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS clinic_settings CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS record_attachments CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS communication_type CASCADE;
DROP TYPE IF EXISTS communication_status CASCADE;
DROP TYPE IF EXISTS record_type CASCADE;
DROP TYPE IF EXISTS attachment_type CASCADE;

-- Nova estrutura de tabelas com roles atualizados

CREATE TABLE "User"(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin','profissional')),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

CREATE TABLE "Professional"(
  id uuid primary key default gen_random_uuid(),
  userId uuid not null references "User"(id),
  nome text not null,
  especialidade text not null,
  registroConselho text,
  ativo boolean not null default true,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
CREATE INDEX ON "Professional"(ativo, nome);

CREATE TABLE "Patient"(
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nascimento date,
  contatos jsonb not null default '{}',         -- {email?, telefone?}
  responsavel jsonb not null default '{}',      -- {nome?, cpf?, telefone?}
  convenio jsonb,                               -- {nome?, numero?}
  consentimentos jsonb not null,                -- {lgpd:boolean, termoAssinadoEm?:string}
  tags text[] not null default '{}',
  observacoes text,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
CREATE INDEX ON "Patient"(nome);
CREATE INDEX ON "Patient"((contatos->>'telefone'));

CREATE TABLE "Appointment"(
  id uuid primary key default gen_random_uuid(),
  patientId uuid not null references "Patient"(id),
  professionalId uuid not null references "Professional"(id),
  inicio timestamptz not null,
  fim timestamptz not null,
  sala text,
  status text not null check (status in ('agendado','confirmado','em_atendimento','atendido','falta','cancelado')),
  motivo text,
  notas text,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  check (fim > inicio)
);
CREATE INDEX ON "Appointment"(professionalId, inicio);
-- Ajuda a detectar conflito (não substitui a query):
CREATE INDEX ON "Appointment"(professionalId, inicio, fim);

CREATE TABLE "RecordEntry"(
  id uuid primary key default gen_random_uuid(),
  patientId uuid not null references "Patient"(id),
  professionalId uuid not null references "Professional"(id),
  tipo text not null check (tipo in ('anamnese','evolucao','prescricao')),
  conteudo jsonb not null,                      -- markdown ou blocos
  anexos jsonb not null default '[]',
  createdAt timestamptz not null default now()
);

CREATE TABLE "Payment"(
  id uuid primary key default gen_random_uuid(),
  appointmentId uuid not null references "Appointment"(id),
  valor numeric(12,2) not null check (valor >= 0),
  meio text not null check (meio in ('dinheiro','cartao','pix')),
  status text not null check (status in ('pago','estornado')),
  recebidoEm timestamptz not null default now(),
  observacao text,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  unique (appointmentId) deferrable initially immediate
);

CREATE TABLE "AuditLog"(
  id uuid primary key default gen_random_uuid(),
  userId uuid not null references "User"(id),
  entidade text not null,
  entidadeId uuid not null,
  acao text not null check (acao in ('CREATE','UPDATE','DELETE')),
  diff jsonb,
  createdAt timestamptz not null default now()
);

-- Sistema de Anamnese Compartilhado

CREATE TABLE "AnamneseTemplate"(
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  categoria text not null check (categoria in ('pediatrica','adulto','neuropsicologica','fonoaudiologica','psicologica','geral')),
  especialidade text[] not null default '{}',
  template jsonb not null,                     -- Estrutura do formulário
  ativo boolean not null default true,
  versao integer not null default 1,
  criadoPor uuid not null references "User"(id),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
CREATE INDEX ON "AnamneseTemplate"(categoria, ativo);
CREATE INDEX ON "AnamneseTemplate"(especialidade);

CREATE TABLE "AnamneseCompartilhada"(
  id uuid primary key default gen_random_uuid(),
  templateId uuid references "AnamneseTemplate"(id),
  titulo text not null,
  pacienteNome text not null,
  pacienteIdade integer,
  pacienteGenero text,
  queixaPrincipal text not null,
  dadosAnamnese jsonb not null,               -- Dados preenchidos da anamnese
  observacoes text,
  tags text[] not null default '{}',
  categoria text not null check (categoria in ('pediatrica','adulto','neuropsicologica','fonoaudiologica','psicologica','geral')),
  visibilidade text not null check (visibilidade in ('publica','privada','equipe')) default 'equipe',
  patientId uuid references "Patient"(id),    -- Opcional: vinculação com paciente real
  profissionalId uuid not null references "Professional"(id),
  criadoPor uuid not null references "User"(id),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
CREATE INDEX ON "AnamneseCompartilhada"(categoria, visibilidade);
CREATE INDEX ON "AnamneseCompartilhada"(tags);
CREATE INDEX ON "AnamneseCompartilhada"(pacienteNome);
CREATE INDEX ON "AnamneseCompartilhada"(queixaPrincipal);

CREATE TABLE "AnamneseFavoritos"(
  id uuid primary key default gen_random_uuid(),
  userId uuid not null references "User"(id),
  anamneseId uuid not null references "AnamneseCompartilhada"(id),
  createdAt timestamptz not null default now(),
  unique(userId, anamneseId)
);

CREATE TABLE "AnamneseComentarios"(
  id uuid primary key default gen_random_uuid(),
  anamneseId uuid not null references "AnamneseCompartilhada"(id),
  userId uuid not null references "User"(id),
  comentario text not null,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
CREATE INDEX ON "AnamneseComentarios"(anamneseId, createdAt);

-- Inserir configurações padrão
INSERT INTO "User" (name, email, password_hash, role) VALUES 
('Admin', 'admin@sapere.com', '$2b$10$dummy.hash.for.development', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir templates de anamnese padrão
INSERT INTO "AnamneseTemplate" (nome, descricao, categoria, especialidade, template, criadoPor) VALUES 
(
  'Anamnese Pediátrica Geral',
  'Template básico para anamnese pediátrica',
  'pediatrica',
  ARRAY['pediatria', 'neurologia', 'psicologia'],
  '{
    "sections": [
      {
        "title": "Dados Pessoais",
        "fields": [
          {"name": "nome_completo", "type": "text", "label": "Nome completo", "required": true},
          {"name": "data_nascimento", "type": "date", "label": "Data de nascimento", "required": true},
          {"name": "idade", "type": "number", "label": "Idade", "required": true},
          {"name": "genero", "type": "select", "label": "Gênero", "options": ["Masculino", "Feminino", "Outro"], "required": true}
        ]
      },
      {
        "title": "Queixa Principal",
        "fields": [
          {"name": "queixa_principal", "type": "textarea", "label": "Queixa principal", "required": true},
          {"name": "inicio_sintomas", "type": "text", "label": "Quando iniciaram os sintomas?", "required": true},
          {"name": "fatores_desencadeantes", "type": "textarea", "label": "Fatores desencadeantes"}
        ]
      },
      {
        "title": "História Perinatal",
        "fields": [
          {"name": "gestacao_planejada", "type": "radio", "label": "Gestação planejada?", "options": ["Sim", "Não"]},
          {"name": "intercorrencias_gestacao", "type": "textarea", "label": "Intercorrências na gestação"},
          {"name": "tipo_parto", "type": "select", "label": "Tipo de parto", "options": ["Normal", "Cesárea", "Fórceps"]},
          {"name": "peso_nascimento", "type": "text", "label": "Peso ao nascer"},
          {"name": "apgar", "type": "text", "label": "APGAR"}
        ]
      },
      {
        "title": "Desenvolvimento Neuropsicomotor",
        "fields": [
          {"name": "sustentou_cabeca", "type": "text", "label": "Idade que sustentou a cabeça"},
          {"name": "sentou_sem_apoio", "type": "text", "label": "Idade que sentou sem apoio"},
          {"name": "engatinhou", "type": "text", "label": "Idade que engatinhou"},
          {"name": "andou", "type": "text", "label": "Idade que andou"},
          {"name": "primeiras_palavras", "type": "text", "label": "Primeiras palavras"},
          {"name": "controle_esfincteriano", "type": "text", "label": "Controle esfincteriano"}
        ]
      },
      {
        "title": "História Médica",
        "fields": [
          {"name": "doencas_anteriores", "type": "textarea", "label": "Doenças anteriores"},
          {"name": "cirurgias", "type": "textarea", "label": "Cirurgias"},
          {"name": "medicamentos", "type": "textarea", "label": "Medicamentos em uso"},
          {"name": "alergias", "type": "textarea", "label": "Alergias"},
          {"name": "hospitalizacoes", "type": "textarea", "label": "Hospitalizações"}
        ]
      }
    ]
  }',
  (SELECT id FROM "User" WHERE email = 'admin@sapere.com' LIMIT 1)
),
(
  'Anamnese Neuropsicológica',
  'Template para avaliação neuropsicológica',
  'neuropsicologica',
  ARRAY['neuropsicologia', 'neurologia'],
  '{
    "sections": [
      {
        "title": "Dados de Identificação",
        "fields": [
          {"name": "nome", "type": "text", "label": "Nome", "required": true},
          {"name": "idade", "type": "number", "label": "Idade", "required": true},
          {"name": "escolaridade", "type": "text", "label": "Escolaridade", "required": true},
          {"name": "profissao", "type": "text", "label": "Profissão"}
        ]
      },
      {
        "title": "Queixa e História da Doença Atual",
        "fields": [
          {"name": "queixa_principal", "type": "textarea", "label": "Queixa principal", "required": true},
          {"name": "historia_doenca", "type": "textarea", "label": "História da doença atual"},
          {"name": "sintomas_cognitivos", "type": "textarea", "label": "Sintomas cognitivos relatados"}
        ]
      },
      {
        "title": "Funções Cognitivas",
        "fields": [
          {"name": "atencao_concentracao", "type": "textarea", "label": "Atenção e concentração"},
          {"name": "memoria", "type": "textarea", "label": "Memória"},
          {"name": "linguagem", "type": "textarea", "label": "Linguagem"},
          {"name": "funcoes_executivas", "type": "textarea", "label": "Funções executivas"},
          {"name": "orientacao", "type": "textarea", "label": "Orientação"}
        ]
      }
    ]
  }',
  (SELECT id FROM "User" WHERE email = 'admin@sapere.com' LIMIT 1)
);