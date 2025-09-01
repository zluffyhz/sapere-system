-- Simplified schema for Vercel deployment
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (simplified)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'therapist',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patients table (simplified)
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

-- Professionals table (simplified)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    specialty VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments table (simplified)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    professional_id UUID REFERENCES users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    room VARCHAR(100),
    type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_appointments_start ON appointments(start_time);

-- Insert default admin user
INSERT INTO users (name, email, password, role, status) VALUES 
('Admin Sapere', 'admin@sapere.com.br', '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert test user
INSERT INTO users (name, email, password, role, status) VALUES 
('User Test', 'teste@sapere.com.br', '$2a$10$jP7AdT4TBlPSnYyIm6oNOOyRcejpVDDU0LerUMVHSIeiECvzl2DMq', 'therapist', 'active')
ON CONFLICT (email) DO NOTHING;