-- Migration para sistema de documentos de anamnese
-- Criado para gerenciar upload real de PDFs com versionamento e organização por paciente

-- Tabela principal para documentos de anamnese
CREATE TABLE IF NOT EXISTS anamnese_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    
    -- Sistema de versionamento
    version INTEGER NOT NULL DEFAULT 1,
    parent_document_id UUID REFERENCES anamnese_documents(id) ON DELETE SET NULL,
    is_latest_version BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadados e categorização
    document_type VARCHAR(50) NOT NULL DEFAULT 'anamnese',
    title VARCHAR(255),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadados extraídos do PDF
    metadata JSONB DEFAULT '{}',
    page_count INTEGER,
    
    -- Status e permissões
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
    
    -- Auditoria
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Controle de acesso
    access_permissions JSONB DEFAULT '{"read": [], "write": [], "admin": []}',
    
    -- Índices para performance
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800), -- 50MB máximo
    CONSTRAINT valid_version CHECK (version > 0)
);

-- Tabela para histórico de ações nos documentos
CREATE TABLE IF NOT EXISTS anamnese_document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES anamnese_documents(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('upload', 'update', 'download', 'view', 'delete', 'restore', 'version_create')),
    action_description TEXT,
    
    -- Metadados da ação
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    
    -- Auditoria
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Tabela para anotações e comentários nos documentos
CREATE TABLE IF NOT EXISTS anamnese_document_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES anamnese_documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    
    -- Posição na página (coordenadas)
    position_x DECIMAL(10,6),
    position_y DECIMAL(10,6),
    width DECIMAL(10,6),
    height DECIMAL(10,6),
    
    -- Conteúdo da anotação
    annotation_type VARCHAR(20) NOT NULL DEFAULT 'comment' CHECK (annotation_type IN ('comment', 'highlight', 'note', 'drawing')),
    content TEXT NOT NULL,
    color VARCHAR(7) DEFAULT '#FFFF00', -- Hex color
    
    -- Auditoria
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_page_number CHECK (page_number > 0),
    CONSTRAINT valid_position CHECK (
        (position_x IS NULL AND position_y IS NULL AND width IS NULL AND height IS NULL) OR
        (position_x >= 0 AND position_y >= 0 AND width > 0 AND height > 0)
    )
);

-- Tabela para compartilhamento de documentos
CREATE TABLE IF NOT EXISTS anamnese_document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES anamnese_documents(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with_role VARCHAR(50),
    
    -- Permissões específicas
    can_view BOOLEAN NOT NULL DEFAULT TRUE,
    can_download BOOLEAN NOT NULL DEFAULT FALSE,
    can_annotate BOOLEAN NOT NULL DEFAULT FALSE,
    can_share BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Controle temporal
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    shared_by UUID NOT NULL REFERENCES users(id),
    shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(document_id, shared_with_user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_patient_id ON anamnese_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_uploaded_by ON anamnese_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_uploaded_at ON anamnese_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_status ON anamnese_documents(status);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_document_type ON anamnese_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_is_latest ON anamnese_documents(is_latest_version) WHERE is_latest_version = TRUE;
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_parent ON anamnese_documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_tags ON anamnese_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_anamnese_documents_metadata ON anamnese_documents USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_anamnese_document_history_document_id ON anamnese_document_history(document_id);
CREATE INDEX IF NOT EXISTS idx_anamnese_document_history_performed_at ON anamnese_document_history(performed_at);
CREATE INDEX IF NOT EXISTS idx_anamnese_document_history_performed_by ON anamnese_document_history(performed_by);

CREATE INDEX IF NOT EXISTS idx_anamnese_document_annotations_document_id ON anamnese_document_annotations(document_id);
CREATE INDEX IF NOT EXISTS idx_anamnese_document_annotations_created_by ON anamnese_document_annotations(created_by);

CREATE INDEX IF NOT EXISTS idx_anamnese_document_shares_document_id ON anamnese_document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_anamnese_document_shares_user_id ON anamnese_document_shares(shared_with_user_id);

-- Triggers para auditoria automática
CREATE OR REPLACE FUNCTION update_anamnese_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_anamnese_documents_timestamp 
    BEFORE UPDATE ON anamnese_documents 
    FOR EACH ROW EXECUTE FUNCTION update_anamnese_document_timestamp();

-- Trigger para manter apenas uma versão como latest
CREATE OR REPLACE FUNCTION manage_document_versions()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando uma nova versão é marcada como latest, desmarcar as anteriores
    IF NEW.is_latest_version = TRUE THEN
        UPDATE anamnese_documents 
        SET is_latest_version = FALSE 
        WHERE patient_id = NEW.patient_id 
        AND document_type = NEW.document_type 
        AND id != NEW.id
        AND (parent_document_id = NEW.parent_document_id OR id = NEW.parent_document_id OR parent_document_id = NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER manage_document_versions_trigger 
    AFTER INSERT OR UPDATE ON anamnese_documents 
    FOR EACH ROW EXECUTE FUNCTION manage_document_versions();

-- Trigger para log de ações
CREATE OR REPLACE FUNCTION log_document_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO anamnese_document_history (document_id, action_type, action_description, new_values, performed_by)
        VALUES (NEW.id, 'upload', 'Documento enviado', row_to_json(NEW), NEW.uploaded_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO anamnese_document_history (document_id, action_type, action_description, old_values, new_values, performed_by)
        VALUES (NEW.id, 'update', 'Documento atualizado', row_to_json(OLD), row_to_json(NEW), NEW.updated_by);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO anamnese_document_history (document_id, action_type, action_description, old_values, performed_by)
        VALUES (OLD.id, 'delete', 'Documento removido', row_to_json(OLD), OLD.uploaded_by);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_document_action_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON anamnese_documents 
    FOR EACH ROW EXECUTE FUNCTION log_document_action();

-- Inserir dados iniciais (tipos de documentos padrão)
INSERT INTO anamnese_documents (id, patient_id, original_filename, stored_filename, file_path, file_size, mime_type, document_type, title, uploaded_by) 
VALUES 
-- Estes são apenas exemplos, serão removidos em produção
('00000000-0000-0000-0000-000000000001', 
 (SELECT id FROM patients LIMIT 1), 
 'exemplo_anamnese.pdf', 
 'exemplo_anamnese_001.pdf', 
 '/uploads/anamnese/exemplo/', 
 1024000, 
 'application/pdf', 
 'anamnese', 
 'Exemplo de documento de anamnese', 
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

COMMENT ON TABLE anamnese_documents IS 'Tabela para gerenciar documentos de anamnese com upload real, versionamento e organização por paciente';
COMMENT ON COLUMN anamnese_documents.parent_document_id IS 'Referência ao documento pai para controle de versões';
COMMENT ON COLUMN anamnese_documents.is_latest_version IS 'Indica se esta é a versão mais recente do documento';
COMMENT ON COLUMN anamnese_documents.metadata IS 'Metadados extraídos do PDF (autor, data criação, etc.)';
COMMENT ON COLUMN anamnese_documents.access_permissions IS 'Permissões específicas de acesso em formato JSON';