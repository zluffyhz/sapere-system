-- Índices para otimização do Sistema Sapere

-- USUÁRIOS
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_phone ON users(phone);

-- TERAPEUTAS
CREATE INDEX idx_therapists_user_id ON therapists(user_id);
CREATE INDEX idx_therapists_professional_id ON therapists(professional_id);
CREATE INDEX idx_therapists_specialties ON therapists USING GIN(specialties);
CREATE INDEX idx_therapists_active ON therapists(active);

-- PACIENTES
CREATE INDEX idx_patients_name ON patients USING GIN(to_tsvector('portuguese', name));
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_patients_diagnosis ON patients USING GIN(diagnosis);
CREATE INDEX idx_patients_responsible_users ON patients USING GIN(responsible_users);
CREATE INDEX idx_patients_created_by ON patients(created_by);
CREATE INDEX idx_patients_updated_at ON patients(updated_at);

-- AGENDAMENTOS
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_confirmed ON appointments(confirmed_by_patient);
CREATE INDEX idx_appointments_type ON appointments(appointment_type);
CREATE INDEX idx_appointments_original ON appointments(original_appointment_id);
CREATE INDEX idx_appointments_created_by ON appointments(created_by);

-- Índice composto para consultas frequentes de agendamento
CREATE INDEX idx_appointments_therapist_date_status ON appointments(therapist_id, appointment_date, status);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);

-- PRONTUÁRIOS
CREATE INDEX idx_records_patient_id ON records(patient_id);
CREATE INDEX idx_records_therapist_id ON records(therapist_id);
CREATE INDEX idx_records_appointment_id ON records(appointment_id);
CREATE INDEX idx_records_type ON records(record_type);
CREATE INDEX idx_records_date ON records(record_date);
CREATE INDEX idx_records_created_by ON records(created_by);
CREATE INDEX idx_records_parent_record ON records(parent_record_id);
CREATE INDEX idx_records_draft ON records(is_draft);
CREATE INDEX idx_records_reviewed ON records(reviewed_by, reviewed_at);

-- Índice para busca textual em prontuários
CREATE INDEX idx_records_content_search ON records USING GIN(to_tsvector('portuguese', content));
CREATE INDEX idx_records_title_search ON records USING GIN(to_tsvector('portuguese', title));

-- ANEXOS DE PRONTUÁRIOS
CREATE INDEX idx_record_attachments_record_id ON record_attachments(record_id);
CREATE INDEX idx_record_attachments_type ON record_attachments(attachment_type);
CREATE INDEX idx_record_attachments_uploaded_by ON record_attachments(uploaded_by);

-- COMUNICAÇÕES
CREATE INDEX idx_communications_patient_id ON communications(patient_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_appointment_id ON communications(appointment_id);
CREATE INDEX idx_communications_scheduled_for ON communications(scheduled_for);
CREATE INDEX idx_communications_sent_at ON communications(sent_at);
CREATE INDEX idx_communications_created_at ON communications(created_at);

-- Índice composto para comunicações pendentes
CREATE INDEX idx_communications_pending ON communications(status, scheduled_for) 
WHERE status IN ('pending', 'failed');

-- LOG DE ATIVIDADES
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Índice composto para consultas de auditoria
CREATE INDEX idx_activity_logs_user_resource ON activity_logs(user_id, resource_type, created_at);

-- ÍNDICES DE PERFORMANCE ESPECÍFICOS

-- Para relatórios de agendamentos por período
CREATE INDEX idx_appointments_period_report ON appointments(appointment_date, status, therapist_id);

-- Para dashboard de pacientes ativos
CREATE INDEX idx_patients_dashboard ON patients(active, created_at, updated_at);

-- Para listagem de prontuários recentes
CREATE INDEX idx_records_recent ON records(patient_id, record_date DESC, is_draft);

-- Para comunicações por paciente
CREATE INDEX idx_communications_patient_timeline ON communications(patient_id, created_at DESC);

-- ÍNDICES PARCIAIS (apenas registros ativos/relevantes)

-- Apenas usuários ativos
CREATE INDEX idx_users_active ON users(email, role) WHERE status = 'active';

-- Apenas terapeutas ativos
CREATE INDEX idx_therapists_active_scheduling ON therapists(id, available_hours) WHERE active = true;

-- Apenas agendamentos futuros (sem CURRENT_TIMESTAMP devido a limitação IMMUTABLE)
CREATE INDEX idx_appointments_future ON appointments(therapist_id, appointment_date) 
WHERE status NOT IN ('cancelled', 'completed');

-- Apenas pacientes ativos
CREATE INDEX idx_patients_active_search ON patients USING GIN(to_tsvector('portuguese', name)) 
WHERE active = true;

-- Apenas prontuários não-rascunho
CREATE INDEX idx_records_published ON records(patient_id, record_date DESC) 
WHERE is_draft = false;