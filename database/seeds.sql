-- Seeds para o Sistema Sapere
-- Dados de exemplo para desenvolvimento e teste

-- Limpar dados existentes (cuidado em produção!)
-- TRUNCATE TABLE activity_logs, communications, record_attachments, records, appointments, patients, therapists, users, clinic_settings RESTART IDENTITY CASCADE;

-- 1. CONFIGURAÇÕES DA CLÍNICA
INSERT INTO clinic_settings (
    clinic_name,
    clinic_phone,
    clinic_email,
    clinic_whatsapp,
    address,
    business_hours,
    appointment_settings,
    communication_settings,
    default_messages
) VALUES (
    'Sapere - Clínica de Neurodivergentes',
    '+55 92 99230-5850',
    'Sapere.recepcao@gmail.com',
    '+55 92 99230-5850',
    '{
        "street": "Avenida das Flores",
        "number": "123",
        "complement": "Sala 201",
        "neighborhood": "Centro",
        "city": "Manaus",
        "state": "AM",
        "zip_code": "69000-000",
        "country": "Brasil"
    }'::jsonb,
    '{
        "monday": {"open": "08:00", "close": "18:00", "active": true},
        "tuesday": {"open": "08:00", "close": "18:00", "active": true},
        "wednesday": {"open": "08:00", "close": "18:00", "active": true},
        "thursday": {"open": "08:00", "close": "18:00", "active": true},
        "friday": {"open": "08:00", "close": "18:00", "active": true},
        "saturday": {"open": "08:00", "close": "12:00", "active": true},
        "sunday": {"open": "08:00", "close": "12:00", "active": false}
    }'::jsonb,
    '{
        "default_duration": 60,
        "min_advance_booking": 24,
        "max_advance_booking": 2160,
        "allow_weekend_booking": false,
        "cancellation_deadline": 24
    }'::jsonb,
    '{
        "reminder_hours_before": [24, 2],
        "whatsapp_enabled": true,
        "sms_enabled": true,
        "email_enabled": true,
        "auto_confirm_enabled": false
    }'::jsonb,
    '{
        "appointment_confirmation": "Olá! Sua consulta na Sapere está agendada para {date} às {time}. Confirme respondendo SIM.",
        "appointment_reminder": "Lembrete: Você tem consulta na Sapere amanhã às {time}. Dúvidas: (92) 99230-5850",
        "appointment_cancelled": "Sua consulta na Sapere foi cancelada. Entre em contato para reagendar: (92) 99230-5850"
    }'::jsonb
) ON CONFLICT DO NOTHING;

-- 2. USUÁRIOS
INSERT INTO users (id, email, password, name, role, status, phone, cpf, birth_date, address) VALUES
-- Administrador
(
    '00000000-0000-0000-0000-000000000001',
    'admin@sapere.com.br',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Administrador Sapere',
    'admin',
    'active',
    '92999999999',
    '11111111111',
    '1980-01-01',
    '{"street": "Rua Principal", "number": "100", "city": "Manaus", "state": "AM", "zip_code": "69000-000"}'::jsonb
),

-- Terapeutas
(
    '00000000-0000-0000-0000-000000000002',
    'dra.maria@sapere.com.br',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Dra. Maria Oliveira Silva',
    'therapist',
    'active',
    '92987654321',
    '22222222222',
    '1985-05-15',
    '{"street": "Av. das Acácias", "number": "200", "city": "Manaus", "state": "AM", "zip_code": "69001-000"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    'dr.joao@sapere.com.br',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Dr. João Santos Pereira',
    'therapist',
    'active',
    '92987654322',
    '33333333333',
    '1982-08-22',
    '{"street": "Rua das Palmeiras", "number": "300", "city": "Manaus", "state": "AM", "zip_code": "69002-000"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000004',
    'dra.ana@sapere.com.br',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Dra. Ana Beatriz Costa',
    'therapist',
    'active',
    '92987654323',
    '44444444444',
    '1987-03-10',
    '{"street": "Av. Central", "number": "400", "city": "Manaus", "state": "AM", "zip_code": "69003-000"}'::jsonb
),

-- Responsáveis
(
    '00000000-0000-0000-0000-000000000005',
    'carlos.mendes@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Carlos Mendes',
    'responsible',
    'active',
    '92988887777',
    '55555555555',
    '1978-12-05',
    '{"street": "Rua das Flores", "number": "150", "city": "Manaus", "state": "AM", "zip_code": "69004-000"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000006',
    'lucia.santos@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Lúcia Santos Rodrigues',
    'responsible',
    'active',
    '92988886666',
    '66666666666',
    '1983-07-20',
    '{"street": "Av. dos Ipês", "number": "250", "city": "Manaus", "state": "AM", "zip_code": "69005-000"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000007',
    'pedro.lima@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5z.yWpgO7a', -- senha: admin123
    'Pedro Lima Silva',
    'responsible',
    'active',
    '92988885555',
    '77777777777',
    '1975-11-30',
    '{"street": "Rua do Sol", "number": "350", "city": "Manaus", "state": "AM", "zip_code": "69006-000"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. TERAPEUTAS
INSERT INTO therapists (id, user_id, professional_id, specialties, bio, experience_years, available_hours, consultation_duration) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'CRP 20/12345',
    ARRAY['Psicologia Infantil', 'TEA (Transtorno do Espectro Autista)', 'ABA (Análise Aplicada do Comportamento)'],
    'Especialista em Transtorno do Espectro Autista com mais de 8 anos de experiência em intervenções comportamentais.',
    8,
    '{
        "monday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "tuesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "wednesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "thursday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "friday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}]
    }'::jsonb,
    60
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'CRP 20/67890',
    ARRAY['Terapia Ocupacional', 'Integração Sensorial', 'ADHD'],
    'Terapeuta ocupacional especializado em integração sensorial e desenvolvimento motor.',
    6,
    '{
        "monday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "wednesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "friday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}]
    }'::jsonb,
    45
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    'CRFa 20/11111',
    ARRAY['Fonoaudiologia', 'Comunicação Alternativa', 'Dislexia'],
    'Fonoaudióloga especializada em comunicação alternativa e distúrbios da comunicação.',
    5,
    '{
        "tuesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "thursday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "saturday": [{"start": "08:00", "end": "12:00"}]
    }'::jsonb,
    50
) ON CONFLICT (id) DO NOTHING;

-- 4. PACIENTES
INSERT INTO patients (
    id, name, email, phone, birth_date, cpf, gender, 
    diagnosis, medications, allergies, special_needs,
    school_info, emergency_contacts, responsible_users,
    general_notes, active, created_by
) VALUES
-- Paciente 1
(
    '20000000-0000-0000-0000-000000000001',
    'Gabriel Mendes Silva',
    null,
    null,
    '2018-03-15',
    '11111111111',
    'Masculino',
    ARRAY['TEA (Transtorno do Espectro Autista)', 'Atraso na linguagem'],
    '[{"name": "Risperidona", "dosage": "1mg", "frequency": "2x ao dia", "prescriber": "Dr. Silva"}]'::jsonb[],
    ARRAY['Alergia a corantes artificiais'],
    'Hipersensibilidade auditiva, preferência por ambientes com pouca estimulação',
    '{"name": "Escola Alegria", "grade": "Pré-escolar", "teacher": "Professora Laura", "observations": "Acompanhamento com auxiliar especializada"}'::jsonb,
    '[
        {"name": "Carlos Mendes", "relationship": "Pai", "phone": "92988887777", "email": "carlos.mendes@email.com"},
        {"name": "Ana Mendes", "relationship": "Mãe", "phone": "92988887778", "email": "ana.mendes@email.com"}
    ]'::jsonb[],
    ARRAY['00000000-0000-0000-0000-000000000005'],
    'Criança muito inteligente, gosta de quebra-cabeças e atividades com números. Apresenta comportamentos estereotipados quando ansioso.',
    true,
    '00000000-0000-0000-0000-000000000002'
),

-- Paciente 2  
(
    '20000000-0000-0000-0000-000000000002',
    'Sofia Rodrigues Santos',
    null,
    null,
    '2015-08-22',
    '22222222222',
    'Feminino',
    ARRAY['ADHD (Transtorno de Déficit de Atenção)', 'Dislexia'],
    '[{"name": "Metilfenidato", "dosage": "10mg", "frequency": "1x ao dia", "prescriber": "Dra. Costa"}]'::jsonb[],
    ARRAY[],
    'Dificuldade de concentração em ambientes ruidosos',
    '{"name": "Colégio São José", "grade": "4º Ano", "teacher": "Professora Maria", "observations": "Precisa de mais tempo para atividades escritas"}'::jsonb,
    '[
        {"name": "Lúcia Santos", "relationship": "Mãe", "phone": "92988886666", "email": "lucia.santos@email.com"},
        {"name": "Roberto Santos", "relationship": "Pai", "phone": "92988886667", "email": "roberto.santos@email.com"}
    ]'::jsonb[],
    ARRAY['00000000-0000-0000-0000-000000000006'],
    'Muito criativa e sociável. Adora desenhar e inventar histórias. Precisa de estratégias visuais para organização.',
    true,
    '00000000-0000-0000-0000-000000000003'
),

-- Paciente 3
(
    '20000000-0000-0000-0000-000000000003',
    'Lucas Silva Lima',
    null,
    null,
    '2012-11-10',
    '33333333333',
    'Masculino',
    ARRAY['Síndrome de Asperger', 'Ansiedade Social'],
    '[]'::jsonb[],
    ARRAY['Intolerância à lactose'],
    'Rotinas bem estruturadas, dificuldade com mudanças imprevistas',
    '{"name": "Escola Municipal Centro", "grade": "7º Ano", "teacher": "Professor João", "observations": "Excelente em matemática e ciências"}'::jsonb,
    '[
        {"name": "Pedro Lima", "relationship": "Pai", "phone": "92988885555", "email": "pedro.lima@email.com"},
        {"name": "Carla Lima", "relationship": "Mãe", "phone": "92988885556", "email": "carla.lima@email.com"}
    ]'::jsonb[],
    ARRAY['00000000-0000-0000-0000-000000000007'],
    'Adolescente com interesses específicos em astronomia e programação. Muito inteligente mas com dificuldades sociais.',
    true,
    '00000000-0000-0000-0000-000000000004'
),

-- Paciente 4
(
    '20000000-0000-0000-0000-000000000004',
    'Beatriz Costa Alves',
    null,
    null,
    '2019-06-30',
    '44444444444',
    'Feminino',
    ARRAY['Atraso Global do Desenvolvimento'],
    '[]'::jsonb[],
    ARRAY[],
    'Baixa coordenação motora, precisa de apoio para atividades de vida diária',
    '{"name": "APAE Manaus", "grade": "Estimulação Precoce", "teacher": "Professora Sandra", "observations": "Programa de estimulação individualizado"}'::jsonb,
    '[
        {"name": "Marina Costa", "relationship": "Mãe", "phone": "92988884444", "email": "marina.costa@email.com"}
    ]'::jsonb[],
    ARRAY['00000000-0000-0000-0000-000000000005'],
    'Criança carinhosa e sorridente. Gosta de música e atividades sensoriais. Progressos lentos mas consistentes.',
    true,
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- 5. AGENDAMENTOS
INSERT INTO appointments (
    id, patient_id, therapist_id, appointment_date, duration, status,
    appointment_type, session_number, notes, created_by
) VALUES
-- Agendamentos passados
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '10000000-0000-0000-0000-000000000001', -- Dra. Maria
    '2024-01-15 10:00:00',
    60,
    'completed',
    'Avaliação Inicial',
    1,
    'Primeira consulta - Anamnese completa realizada',
    '00000000-0000-0000-0000-000000000002'
),
(
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '10000000-0000-0000-0000-000000000001', -- Dra. Maria
    '2024-01-22 10:00:00',
    60,
    'completed',
    'Terapia ABA',
    2,
    'Trabalho com habilidades de comunicação',
    '00000000-0000-0000-0000-000000000002'
),

-- Agendamentos futuros
(
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '10000000-0000-0000-0000-000000000001', -- Dra. Maria
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    60,
    'confirmed',
    'Terapia ABA',
    3,
    'Continuidade do programa de comunicação',
    '00000000-0000-0000-0000-000000000002'
),
(
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002', -- Sofia
    '10000000-0000-0000-0000-000000000002', -- Dr. João
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    45,
    'scheduled',
    'Terapia Ocupacional',
    1,
    'Primeira consulta - Avaliação sensorial',
    '00000000-0000-0000-0000-000000000003'
),
(
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000003', -- Lucas
    '10000000-0000-0000-0000-000000000003', -- Dra. Ana
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    50,
    'scheduled',
    'Fonoaudiologia',
    5,
    'Trabalho com habilidades sociais de comunicação',
    '00000000-0000-0000-0000-000000000004'
) ON CONFLICT (id) DO NOTHING;

-- 6. PRONTUÁRIOS/REGISTROS
INSERT INTO records (
    id, patient_id, therapist_id, appointment_id, record_type, title, content,
    assessment_data, evolution_data, goals, interventions,
    mood, attention_level, cooperation_level, family_guidelines,
    record_date, created_by
) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '10000000-0000-0000-0000-000000000001', -- Dra. Maria
    '30000000-0000-0000-0000-000000000001', -- Primeira consulta
    'initial_assessment',
    'Avaliação Inicial - Gabriel Mendes Silva',
    'Criança de 5 anos com diagnóstico de TEA. Pais relatam dificuldades na comunicação verbal e comportamentos repetitivos. Criança apresentou-se calma durante a avaliação, mantendo contato visual esporádico.',
    '{
        "developmental_milestones": {
            "motor": "Adequado para idade",
            "language": "Atraso significativo",
            "social": "Dificuldades importantes",
            "cognitive": "Dentro da normalidade"
        },
        "behavioral_observations": {
            "attention": "Boa quando interessado",
            "compliance": "Colaborativo com estrutura",
            "sensory": "Hipersensibilidade auditiva"
        }
    }'::jsonb,
    null,
    '[
        {"area": "Comunicação", "goal": "Aumentar vocabulário expressivo", "target_date": "2024-06-01"},
        {"area": "Social", "goal": "Melhorar interação com pares", "target_date": "2024-08-01"},
        {"area": "Comportamental", "goal": "Reduzir estereotipias", "target_date": "2024-07-01"}
    ]'::jsonb[],
    ARRAY['ABA - Análise Aplicada do Comportamento', 'PECS - Sistema de Comunicação por Troca de Figuras'],
    'Tranquilo',
    4,
    4,
    'Manter rotinas estruturadas em casa. Usar apoios visuais para comunicação. Evitar ambientes muito ruidosos.',
    '2024-01-15 11:00:00',
    '00000000-0000-0000-0000-000000000002'
),
(
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '10000000-0000-0000-0000-000000000001', -- Dra. Maria
    '30000000-0000-0000-0000-000000000002', -- Segunda consulta
    'evolution',
    'Evolução - Sessão 2',
    'Paciente demonstrou melhora na atenção compartilhada. Conseguiu realizar atividades estruturadas por 20 minutos. Pais relatam que está usando mais gestos em casa.',
    null,
    '{
        "session_focus": "Comunicação funcional",
        "activities": ["Pareamento de objetos", "Imitação de gestos", "Brincadeira com bolhas"],
        "achievements": ["Apontou para objetos desejados", "Imitou 3 gestos novos"],
        "challenges": ["Dificuldade em esperar a vez", "Resistência a mudanças na rotina"]
    }'::jsonb,
    '[
        {"area": "Comunicação", "progress": "Progredindo", "notes": "Usando mais gestos"},
        {"area": "Social", "progress": "Iniciando", "notes": "Primeiro trabalho com atenção compartilhada"}
    ]'::jsonb[],
    ARRAY['Treino de comunicação funcional', 'Brincadeira estruturada'],
    'Alegre',
    4,
    5,
    'Continuar com apoios visuais. Incentivar uso de gestos em situações cotidianas.',
    '2024-01-22 11:00:00',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- 7. COMUNICAÇÕES
INSERT INTO communications (
    id, patient_id, user_id, type, status, subject, message,
    to_phone, appointment_id, sent_at, created_by
) VALUES
(
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001', -- Gabriel
    '00000000-0000-0000-0000-000000000005', -- Carlos (pai)
    'whatsapp',
    'delivered',
    'Confirmação de consulta',
    'Olá Carlos! Confirmamos a consulta do Gabriel para amanhã às 10h com a Dra. Maria. Qualquer dúvida, entre em contato: (92) 99230-5850',
    '92988887777',
    '30000000-0000-0000-0000-000000000003',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    '00000000-0000-0000-0000-000000000001'
),
(
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002', -- Sofia
    '00000000-0000-0000-0000-000000000006', -- Lúcia (mãe)
    'email',
    'sent',
    'Lembrete de consulta',
    'Prezada Lúcia, lembramos que a Sofia tem consulta marcada para depois de amanhã às 14h30 com o Dr. João. Caso precise remarcar, entre em contato conosco.',
    null,
    '30000000-0000-0000-0000-000000000004',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- 8. LOGS DE ATIVIDADE (exemplos)
INSERT INTO activity_logs (
    id, user_id, action, resource_type, resource_id,
    old_values, new_values, ip_address, created_at
) VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'create',
    'record',
    '40000000-0000-0000-0000-000000000001',
    null,
    '{"title": "Avaliação Inicial - Gabriel Mendes Silva", "type": "initial_assessment"}'::jsonb,
    '192.168.1.100'::inet,
    '2024-01-15 11:05:00'
),
(
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'update',
    'appointment',
    '30000000-0000-0000-0000-000000000003',
    '{"status": "scheduled"}'::jsonb,
    '{"status": "confirmed", "confirmed_at": "2024-01-20T10:30:00"}'::jsonb,
    '192.168.1.101'::inet,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

-- Atualizar timestamps de updated_at para dados criados
UPDATE users SET updated_at = CURRENT_TIMESTAMP;
UPDATE therapists SET updated_at = CURRENT_TIMESTAMP;
UPDATE patients SET updated_at = CURRENT_TIMESTAMP;
UPDATE appointments SET updated_at = CURRENT_TIMESTAMP;
UPDATE records SET updated_at = CURRENT_TIMESTAMP;