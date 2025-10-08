-- Criar tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    pause_time TIMESTAMP WITH TIME ZONE,
    resume_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER, -- em segundos
    pause_duration INTEGER DEFAULT 0, -- em segundos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_appointment_id ON sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Trigger para updated_at automático
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentário da tabela
COMMENT ON TABLE sessions IS 'Sessões de terapia com controle de tempo (timer)';
COMMENT ON COLUMN sessions.total_duration IS 'Duração total da sessão em segundos, descontando pausas';
COMMENT ON COLUMN sessions.pause_duration IS 'Tempo total de pausas em segundos';

-- Dados de teste (opcional)
-- INSERT INTO sessions (therapist_id, patient_id, status, start_time) VALUES 
-- ('therapist-uuid-here', 'patient-uuid-here', 'active', NOW());

SELECT 'Tabela sessions criada com sucesso!' as status;