-- Migration: Sistema Completo de Gestão de Terapeutas
-- Data: 2025-01-10
-- Descrição: Cria tabelas para especialidades, produtividade e feedbacks

-- 1. Tabela de Especialidades
CREATE TABLE IF NOT EXISTS specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'neuropsicologia', 'terapia_comportamental', etc.
    icon VARCHAR(50), -- nome do ícone para UI
    color VARCHAR(7), -- cor hexadecimal (#FF0000)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de relacionamento Terapeutas <-> Especialidades (M:N)
CREATE TABLE IF NOT EXISTS therapist_specialties (
    therapist_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    experience_level INTEGER NOT NULL CHECK (experience_level >= 1 AND experience_level <= 5),
    certified BOOLEAN DEFAULT false,
    certification_date DATE,
    certification_body VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (therapist_id, specialty_id),
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
);

-- 3. Tabela de Produtividade dos Terapeutas
CREATE TABLE IF NOT EXISTS therapist_productivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- em segundos
    avg_session_duration INTEGER DEFAULT 0, -- em segundos
    total_patients INTEGER DEFAULT 0,
    new_patients INTEGER DEFAULT 0,
    returning_patients INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0.00, -- percentual
    no_show_rate DECIMAL(5,2) DEFAULT 0.00, -- percentual
    patient_satisfaction_score DECIMAL(3,2), -- 1.00-5.00
    revenue_generated DECIMAL(10,2), -- valor em reais
    sessions_per_day_avg DECIMAL(4,2) DEFAULT 0.00,
    peak_hours JSONB, -- ['09:00', '14:00', '16:00']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
    UNIQUE(therapist_id, period_start, period_end)
);

-- 4. Tabela de Feedback dos Pacientes
CREATE TABLE IF NOT EXISTS patient_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    therapist_id UUID NOT NULL,
    session_id UUID,
    appointment_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB, -- {'professionalism': 5, 'communication': 4, ...}
    anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- 5. Expandir tabela de terapeutas com novos campos
ALTER TABLE therapists 
ADD COLUMN IF NOT EXISTS bio_extended TEXT,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS certifications JSONB, -- ['CRP', 'Especialização X', ...]
ADD COLUMN IF NOT EXISTS social_links JSONB, -- {'linkedin': 'url', 'instagram': 'url', ...}
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8,2);

-- 6. Expandir tabela de usuários com novos campos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'pt-BR';

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_therapist_specialties_therapist ON therapist_specialties(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_specialties_specialty ON therapist_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_therapist_productivity_therapist ON therapist_productivity(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_productivity_period ON therapist_productivity(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_patient_feedback_therapist ON patient_feedback(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_feedback_patient ON patient_feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_feedback_rating ON patient_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_specialties_category ON specialties(category);
CREATE INDEX IF NOT EXISTS idx_specialties_active ON specialties(active);

-- 8. Inserir especialidades padrão
INSERT INTO specialties (name, description, category, icon, color) VALUES
('Neuropsicologia', 'Avaliação e reabilitação de funções cognitivas', 'neuropsicologia', 'brain', '#8B5CF6'),
('TDAH', 'Transtorno do Déficit de Atenção com Hiperatividade', 'neuropsicologia', 'zap', '#F59E0B'),
('Terapia TEA', 'Terapia para Transtorno do Espectro Autista', 'terapia_comportamental', 'heart', '#10B981'),
('Avaliação Neuropsicológica', 'Avaliação completa das funções cognitivas', 'avaliacao', 'clipboard', '#3B82F6'),
('Dislexia', 'Distúrbios de aprendizagem e leitura', 'neuropsicologia', 'book', '#EF4444'),
('Psicoterapia Infantil', 'Terapia para crianças e adolescentes', 'psicoterapia', 'user', '#14B8A6'),
('Ludoterapia', 'Terapia através de jogos e brincadeiras', 'psicoterapia', 'gamepad2', '#F97316'),
('Terapia Comportamental', 'Modificação de comportamentos', 'terapia_comportamental', 'activity', '#8B5CF6'),
('Terapia Familiar', 'Terapia sistêmica familiar', 'psicoterapia', 'users', '#06B6D4'),
('Orientação Vocacional', 'Orientação profissional e vocacional', 'orientacao', 'compass', '#84CC16')
ON CONFLICT (name) DO NOTHING;

-- 9. Triggers para atualização automática
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_productivity_updated_at BEFORE UPDATE ON therapist_productivity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Comentários nas tabelas
COMMENT ON TABLE specialties IS 'Catálogo de especialidades terapêuticas';
COMMENT ON TABLE therapist_specialties IS 'Relacionamento M:N entre terapeutas e especialidades';
COMMENT ON TABLE therapist_productivity IS 'Métricas de produtividade dos terapeutas por período';
COMMENT ON TABLE patient_feedback IS 'Avaliações dos pacientes sobre os terapeutas';

COMMENT ON COLUMN therapist_specialties.experience_level IS '1=Iniciante, 2=Básico, 3=Intermediário, 4=Avançado, 5=Especialista';
COMMENT ON COLUMN therapist_productivity.total_duration IS 'Duração total das sessões em segundos';
COMMENT ON COLUMN therapist_productivity.peak_hours IS 'Array JSON com os horários de pico do terapeuta';
COMMENT ON COLUMN patient_feedback.categories IS 'JSON com avaliações por categoria (profissionalismo, comunicação, etc.)';