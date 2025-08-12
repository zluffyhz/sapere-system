-- 🐘 Script de Setup PostgreSQL - Sistema Sapere
-- Execute este script para configurar o banco de produção

-- Criar database (executar como superuser)
-- CREATE DATABASE sapere_production;
-- CREATE USER sapere_user WITH PASSWORD 'sua_senha_segura';
-- GRANT ALL PRIVILEGES ON DATABASE sapere_production TO sapere_user;

-- =========================================================
-- TABELAS PRINCIPAIS
-- =========================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'therapist' CHECK (role IN ('admin', 'therapist', 'professional', 'responsible')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    phone VARCHAR(20),
    cpf VARCHAR(14),
    birth_date DATE,
    address JSONB,
    bio TEXT,
    avatar_url VARCHAR(500),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de terapeutas/profissionais
CREATE TABLE IF NOT EXISTS therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professional_id VARCHAR(50),
    specialties TEXT[],
    bio TEXT,
    experience_years INTEGER,
    languages TEXT[],
    available_hours JSONB,
    consultation_duration INTEGER DEFAULT 50,
    max_daily_appointments INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    social_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    gender VARCHAR(20),
    address JSONB,
    diagnosis TEXT[],
    medications JSONB[],
    allergies TEXT[],
    special_needs TEXT,
    school_info JSONB,
    responsible_users UUID[],
    emergency_contacts JSONB[],
    general_notes TEXT,
    internal_notes TEXT,
    active BOOLEAN DEFAULT true,
    first_appointment_at TIMESTAMP WITH TIME ZONE,
    last_appointment_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 50,
    timezone VARCHAR(50) DEFAULT 'America/Manaus',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    confirmed_by_patient BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmation_attempts INTEGER DEFAULT 0,
    appointment_type VARCHAR(100),
    session_number INTEGER,
    notes TEXT,
    original_appointment_id UUID,
    rescheduled_reason TEXT,
    cancelled_reason TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prontuários/registros
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    record_type VARCHAR(50) DEFAULT 'evolution' CHECK (record_type IN ('initial_assessment', 'evolution', 'discharge', 'intercurrence', 'family_guidance')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    goals JSONB,
    interventions TEXT[],
    mood VARCHAR(50),
    attention_level INTEGER CHECK (attention_level BETWEEN 1 AND 10),
    cooperation_level INTEGER CHECK (cooperation_level BETWEEN 1 AND 10),
    family_guidelines TEXT,
    homework TEXT,
    next_steps TEXT,
    is_draft BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    record_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comunicações
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('sms', 'email', 'whatsapp', 'call')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    to_phone VARCHAR(20),
    to_email VARCHAR(255),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anamneses compartilhadas
CREATE TABLE IF NOT EXISTS anamneses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100),
    titulo VARCHAR(255) NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    professional_id UUID REFERENCES therapists(id) ON DELETE CASCADE,
    professional_name VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    visibilidade VARCHAR(20) DEFAULT 'publica' CHECK (visibilidade IN ('publica', 'privada')),
    tags TEXT[],
    observacoes TEXT,
    conteudo JSONB NOT NULL,
    arquivos_anexos JSONB[],
    criado_por VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================================

-- Usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Terapeutas
CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON therapists(active);

-- Pacientes
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

-- Agendamentos
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Prontuários
CREATE INDEX IF NOT EXISTS idx_records_patient_id ON records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_therapist_id ON records(therapist_id);
CREATE INDEX IF NOT EXISTS idx_records_appointment_id ON records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_records_record_date ON records(record_date);
CREATE INDEX IF NOT EXISTS idx_records_record_type ON records(record_type);

-- Comunicações
CREATE INDEX IF NOT EXISTS idx_communications_patient_id ON communications(patient_id);
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- Anamneses
CREATE INDEX IF NOT EXISTS idx_anamneses_patient_id ON anamneses(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_professional_id ON anamneses(professional_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_categoria ON anamneses(categoria);
CREATE INDEX IF NOT EXISTS idx_anamneses_criado_em ON anamneses(criado_em);

-- =========================================================
-- TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas que têm updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamneses_updated_at BEFORE UPDATE ON anamneses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- USUÁRIO ADMIN PADRÃO
-- =========================================================

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (
    id,
    email, 
    password, 
    name, 
    role, 
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@sapere.com.br',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Administrador',
    'admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- COMENTÁRIOS DAS TABELAS
-- =========================================================

COMMENT ON TABLE users IS 'Usuários do sistema (admins, terapeutas, responsáveis)';
COMMENT ON TABLE therapists IS 'Informações específicas dos terapeutas/profissionais';
COMMENT ON TABLE patients IS 'Pacientes atendidos na clínica';
COMMENT ON TABLE appointments IS 'Agendamentos e consultas';
COMMENT ON TABLE records IS 'Prontuários e registros de evolução';
COMMENT ON TABLE communications IS 'Histórico de comunicações (SMS, email, WhatsApp)';
COMMENT ON TABLE anamneses IS 'Anamneses compartilhadas entre profissionais';

-- =========================================================
-- CONFIGURAÇÕES DE BACKUP E MANUTENÇÃO
-- =========================================================

-- Configurar retenção de logs (opcional)
-- ALTER SYSTEM SET log_min_duration_statement = 1000;
-- ALTER SYSTEM SET log_statement = 'mod';

-- ✅ Setup PostgreSQL concluído!
-- Próximos passos:
-- 1. Configurar variáveis de ambiente (.env.production)
-- 2. Testar conexão: npm run migrate
-- 3. Iniciar aplicação: npm start