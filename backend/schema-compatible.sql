-- Schema compatível com os controladores do Sapere System
-- Estrutura atualizada para funcionar com o código existente

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS anamnesis CASCADE;

-- Tabela de usuários (compatível com authController e userManagementController)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'therapist' CHECK (role IN ('admin', 'therapist', 'responsible')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    birth_date DATE,
    address TEXT,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Índices para otimização
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Tabela de profissionais (terapeutas, médicos, psicólogos)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT true,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_active ON professionals(active);

-- Tabela de pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    cpf VARCHAR(14),
    contacts JSONB NOT NULL DEFAULT '{}', -- {email, phone, address, etc}
    responsible JSONB DEFAULT '{}', -- Responsável (para menores)
    insurance JSONB DEFAULT '{}', -- Convênio
    consent JSONB NOT NULL DEFAULT '{}', -- Consentimentos LGPD, etc
    tags TEXT[] DEFAULT '{}',
    observations TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_patients_contacts_phone ON patients((contacts->>'phone'));

-- Tabela de agendamentos
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    room VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled')),
    type VARCHAR(100), -- Tipo de consulta
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    CONSTRAINT check_appointment_time CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_datetime ON appointments(professional_id, start_time, end_time);

-- Tabela de prontuários/registros
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id),
    appointment_id UUID REFERENCES appointments(id),
    type VARCHAR(100) NOT NULL CHECK (type IN ('anamnesis', 'evolution', 'prescription', 'session_notes', 'assessment')),
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_records_patient_id ON records(patient_id);
CREATE INDEX idx_records_professional_id ON records(professional_id);
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_created_at ON records(created_at);

-- Tabela específica para anamneses compartilhadas
CREATE TABLE anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    title VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    patient_gender VARCHAR(20),
    main_complaint TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}', -- Dados estruturados da anamnese
    observations TEXT,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'team')),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_anamnesis_patient_id ON anamnesis(patient_id);
CREATE INDEX idx_anamnesis_professional_id ON anamnesis(professional_id);
CREATE INDEX idx_anamnesis_category ON anamnesis(category);
CREATE INDEX idx_anamnesis_visibility ON anamnesis(visibility);

-- Inserir usuário administrador padrão
INSERT INTO users (id, email, password, name, role, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@sapere.com.br',
    '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq',  -- Hash de 'Sapere@2025'
    'Administrador Sapere',
    'admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário teste
INSERT INTO users (id, email, password, name, role, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'teste@sapere.com.br',
    '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq',  -- Hash de 'Sapere@2025'
    'Usuário Teste',
    'therapist',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON anamnesis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();