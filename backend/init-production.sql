-- Sapere System - Production PostgreSQL Schema
-- Complete and functional database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'therapist' CHECK (role IN ('admin', 'therapist', 'responsible')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    phone VARCHAR(20),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT users_email_or_username_required CHECK (email IS NOT NULL OR username IS NOT NULL)
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    contacts JSONB DEFAULT '{}',
    responsible JSONB DEFAULT '{}',
    insurance JSONB DEFAULT '{}',
    consent JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    observations TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled')),
    type VARCHAR(100) DEFAULT 'consultation',
    room VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT appointments_valid_time CHECK (end_time > start_time)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_patients_created_by ON patients(created_by);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(DATE(start_time));

-- Insert default admin user (password: Sapere@2025)
INSERT INTO users (name, email, password, role, status) VALUES 
('Admin Sapere', 'admin@sapere.com.br', '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert test therapist (password: Sapere@2025)
INSERT INTO users (name, email, password, role, status) VALUES 
('Dr. Maria Silva', 'maria@sapere.com.br', '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq', 'therapist', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert test responsible (password: Sapere@2025)  
INSERT INTO users (name, email, password, role, status) VALUES
('João Responsável', 'responsavel@sapere.com.br', '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq', 'responsible', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (name, birth_date, gender, contacts, consent, created_by) VALUES 
(
    'João Silva Santos',
    '2010-05-15',
    'masculine',
    '{"email": "joao.santos@email.com", "phone": "(11) 99999-1111"}',
    '{"lgpd": true, "terms": true}',
    (SELECT id FROM users WHERE email = 'admin@sapere.com.br' LIMIT 1)
),
(
    'Ana Maria Ferreira', 
    '2012-08-20',
    'feminine',
    '{"email": "ana.ferreira@email.com", "phone": "(11) 99999-2222"}',
    '{"lgpd": true, "terms": true}',
    (SELECT id FROM users WHERE email = 'admin@sapere.com.br' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (patient_id, professional_id, start_time, end_time, status, notes, created_by) VALUES
(
    (SELECT id FROM patients WHERE name = 'João Silva Santos' LIMIT 1),
    (SELECT id FROM users WHERE email = 'maria@sapere.com.br' LIMIT 1),
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    'scheduled',
    'Consulta de acompanhamento',
    (SELECT id FROM users WHERE email = 'admin@sapere.com.br' LIMIT 1)
),
(
    (SELECT id FROM patients WHERE name = 'Ana Maria Ferreira' LIMIT 1),
    (SELECT id FROM users WHERE email = 'maria@sapere.com.br' LIMIT 1),
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
    'scheduled', 
    'Avaliação inicial',
    (SELECT id FROM users WHERE email = 'admin@sapere.com.br' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();