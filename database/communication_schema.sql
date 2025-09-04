-- Schema adicional para módulo de comunicação
-- Sistema Sapere - Inspirado no iClinic

-- Tabela de templates de comunicação
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- appointment_confirmation, reminder, etc.
    channel VARCHAR(20) NOT NULL, -- whatsapp, email, sms
    
    -- Conteúdo do template
    subject VARCHAR(255), -- Para emails
    content TEXT NOT NULL,
    html_content TEXT, -- Para emails
    text_content TEXT, -- Versão texto para emails
    
    -- Variáveis disponíveis
    variables JSONB DEFAULT '[]', -- ["patient_name", "date", "time"]
    
    -- WhatsApp específico
    whatsapp_template_name VARCHAR(100), -- Nome aprovado pelo WhatsApp
    whatsapp_components JSONB, -- Componentes do template
    
    -- Status e configuração
    active BOOLEAN DEFAULT true,
    compliance_approved BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tabela de configuração de canais
CREATE TABLE communication_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL, -- whatsapp, email, sms
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true,
    
    -- Configuração específica do canal
    config JSONB NOT NULL, -- Credenciais e configurações específicas
    
    -- Limites e custos
    daily_limit INTEGER,
    rate_limit INTEGER, -- mensagens por minuto
    cost_per_message DECIMAL(10,4),
    
    -- Metadados
    provider VARCHAR(50), -- Twilio, SendGrid, Meta, etc.
    last_test_at TIMESTAMP,
    last_test_success BOOLEAN,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Atualizar tabela de communications (já existe, mas vamos adicionar campos)
-- Adicionando colunas que podem estar faltando
ALTER TABLE communications ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES communication_templates(id);
ALTER TABLE communications ADD COLUMN IF NOT EXISTS variables JSONB;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS to_name VARCHAR(255);
ALTER TABLE communications ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT true;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS opt_out_date TIMESTAMP;

-- Tabela de registros de consentimento (LGPD)
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    communication_type VARCHAR(20) NOT NULL, -- whatsapp, email, sms, call
    
    -- Consentimento
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP NOT NULL,
    consent_source VARCHAR(50) NOT NULL, -- web, whatsapp, phone, in_person
    consent_text TEXT NOT NULL,
    
    -- Dados técnicos para auditoria
    ip_address INET,
    user_agent TEXT,
    
    -- Retirada do consentimento
    withdrawn_date TIMESTAMP,
    withdrawal_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de regras de automação
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    
    -- Trigger da automação
    trigger_event VARCHAR(50) NOT NULL, -- appointment_scheduled, patient_registered, etc.
    trigger_conditions JSONB, -- Condições específicas
    
    -- Ações a serem executadas
    actions JSONB NOT NULL, -- Array de ações
    
    -- Estatísticas
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Tabela de logs de automação
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Execução
    trigger_data JSONB,
    execution_result JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Timestamp
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de campanhas de comunicação
CREATE TABLE communication_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- newsletter, reminder, promotion
    
    -- Configuração da campanha
    template_id UUID REFERENCES communication_templates(id),
    channel VARCHAR(20) NOT NULL,
    target_audience JSONB, -- Critérios de segmentação
    
    -- Agendamento
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
    
    -- Estatísticas
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_read INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Tabela de destinatários de campanha
CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES communication_campaigns(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
    
    -- Status específico do destinatário
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações globais de comunicação
CREATE TABLE communication_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Configurações gerais
    clinic_phone VARCHAR(20) DEFAULT '+55 92 99230-5850',
    clinic_email VARCHAR(255) DEFAULT 'Sapere.recepcao@gmail.com',
    clinic_whatsapp VARCHAR(20) DEFAULT '+55 92 99230-5850',
    
    -- Configurações de lembretes
    reminder_hours_before JSONB DEFAULT '[24, 2]',
    auto_reminders_enabled BOOLEAN DEFAULT true,
    
    -- Configurações de opt-out
    auto_opt_out_enabled BOOLEAN DEFAULT true,
    opt_out_keywords JSONB DEFAULT '["PARAR", "SAIR", "CANCELAR", "STOP"]',
    
    -- Configurações de conformidade
    lgpd_compliance_enabled BOOLEAN DEFAULT true,
    consent_required BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 2555, -- ~7 anos
    
    -- Horários de funcionamento para envios
    business_hours JSONB DEFAULT '{
        "monday": {"start": "08:00", "end": "18:00", "active": true},
        "tuesday": {"start": "08:00", "end": "18:00", "active": true},
        "wednesday": {"start": "08:00", "end": "18:00", "active": true},
        "thursday": {"start": "08:00", "end": "18:00", "active": true},
        "friday": {"start": "08:00", "end": "18:00", "active": true},
        "saturday": {"start": "08:00", "end": "12:00", "active": true},
        "sunday": {"start": "08:00", "end": "12:00", "active": false}
    }',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Inserir configurações padrão
INSERT INTO communication_settings (clinic_phone, clinic_email, clinic_whatsapp) 
VALUES ('+55 92 99230-5850', 'Sapere.recepcao@gmail.com', '+55 92 99230-5850')
ON CONFLICT DO NOTHING;

-- Índices para performance
CREATE INDEX idx_communication_templates_type_channel ON communication_templates(type, channel);
CREATE INDEX idx_communication_templates_active ON communication_templates(active);

CREATE INDEX idx_consent_records_patient_type ON consent_records(patient_id, communication_type);
CREATE INDEX idx_consent_records_consent_date ON consent_records(consent_date);
CREATE INDEX idx_consent_records_withdrawn ON consent_records(withdrawn_date) WHERE withdrawn_date IS NOT NULL;

CREATE INDEX idx_automation_rules_active ON automation_rules(active);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_event);

CREATE INDEX idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs(executed_at);

CREATE INDEX idx_campaigns_status ON communication_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON communication_campaigns(scheduled_for);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_patient ON campaign_recipients(patient_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);