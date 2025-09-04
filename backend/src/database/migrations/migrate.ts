import { query } from '../config/database';
import fs from 'fs';
import path from 'path';

const createTables = async () => {
  try {
    console.log('🏥 Iniciando criação das tabelas do Sistema Sapere...');

    // Ler e executar schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await query(schemaSQL);
      console.log('✅ Schema aplicado com sucesso!');
    } else {
      console.log('⚠️  Arquivo schema.sql não encontrado, criando tabelas básicas...');
      
      // Fallback para tabelas básicas
      await query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TYPE user_role AS ENUM ('admin', 'therapist', 'responsible');
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
        
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role user_role DEFAULT 'responsible',
          status user_status DEFAULT 'active',
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Ler e executar indexes.sql
    const indexesPath = path.join(__dirname, '../../database/indexes.sql');
    if (fs.existsSync(indexesPath)) {
      const indexesSQL = fs.readFileSync(indexesPath, 'utf8');
      await query(indexesSQL);
      console.log('✅ Índices criados com sucesso!');
    }

    console.log('🎉 Banco de dados Sapere configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
};

if (require.main === module) {
  createTables().then(() => process.exit(0));
}

export default createTables;