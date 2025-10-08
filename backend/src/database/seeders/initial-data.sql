-- Inserir dados iniciais para produção
-- Este script deve ser executado apenas uma vez na configuração inicial

-- Inserir pacientes de exemplo (apenas se não existirem)
INSERT INTO patients (id, name, email, phone, birth_date, emergency_contacts, general_notes, created_at, updated_at)
SELECT * FROM (VALUES 
  (gen_random_uuid(), 'Maria Silva', 'maria.silva@example.com', '(11) 99999-1234', '1985-03-15', '[{"name": "João Silva", "phone": "(11) 88888-1234", "relationship": "Esposo"}]'::jsonb[], 'Histórico de ansiedade', NOW(), NOW()),
  (gen_random_uuid(), 'Carlos Santos', 'carlos.santos@example.com', '(11) 99999-5678', '1978-07-22', '[{"name": "Ana Santos", "phone": "(11) 88888-5678", "relationship": "Esposa"}]'::jsonb[], 'Sem histórico relevante', NOW(), NOW()),
  (gen_random_uuid(), 'Ana Oliveira', 'ana.oliveira@example.com', '(11) 99999-9012', '1992-11-08', '[{"name": "Pedro Oliveira", "phone": "(11) 88888-9012", "relationship": "Pai"}]'::jsonb[], 'Histórico familiar de depressão', NOW(), NOW())
) AS v(id, name, email, phone, birth_date, emergency_contacts, general_notes, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = v.email);

-- Inserir especialidades de exemplo (apenas se não existirem)
INSERT INTO specialties (name, description, category, icon, color)
SELECT * FROM (VALUES 
  ('Psicologia Clínica', 'Atendimento psicológico individual para adultos', 'clinical', 'brain', '#3B82F6'),
  ('Terapia Cognitivo-Comportamental', 'Abordagem baseada em TCC', 'therapy', 'mind', '#10B981'),
  ('Psicologia Infantil', 'Atendimento especializado para crianças e adolescentes', 'pediatric', 'child', '#F59E0B'),
  ('Terapia de Casal', 'Orientação e terapia para relacionamentos', 'relationship', 'heart', '#EF4444'),
  ('Neuropsicologia', 'Avaliação e reabilitação neuropsicológica', 'neurological', 'brain-scan', '#8B5CF6')
) AS v(name, description, category, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM specialties WHERE name = v.name);

-- Adicionar comentários às tabelas
COMMENT ON TABLE patients IS 'Tabela de pacientes do sistema Sapere';
COMMENT ON TABLE specialties IS 'Especialidades dos terapeutas';
COMMENT ON TABLE anamnese_documents IS 'Documentos de anamnese dos pacientes';

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_patients_name_search ON patients USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_date ON sessions(patient_id, start_time DESC);

-- Verificar e exibir dados inseridos
DO $$
DECLARE
    patient_count INTEGER;
    specialty_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_count FROM patients WHERE active = true;
    SELECT COUNT(*) INTO specialty_count FROM specialties;
    
    RAISE NOTICE 'Dados iniciais inseridos com sucesso:';
    RAISE NOTICE '- Pacientes ativos: %', patient_count;
    RAISE NOTICE '- Especialidades: %', specialty_count;
    RAISE NOTICE 'Sistema pronto para uso!';
END $$;