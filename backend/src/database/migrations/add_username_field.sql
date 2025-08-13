-- Migration: Adicionar campo username para permitir login sem email
-- Data: 2025-08-13

-- Adicionar campo username (opcional)
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;

-- Criar índice para performance
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Comentário na tabela
COMMENT ON COLUMN users.username IS 'Login alternativo sem email (opcional)';

-- Mostrar estrutura atualizada
\d users;