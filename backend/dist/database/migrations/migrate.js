"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createTables = async () => {
    try {
        console.log('🏥 Iniciando criação das tabelas do Sistema Sapere...');
        // Ler e executar schema.sql
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        if (fs_1.default.existsSync(schemaPath)) {
            const schemaSQL = fs_1.default.readFileSync(schemaPath, 'utf8');
            await (0, database_1.query)(schemaSQL);
            console.log('✅ Schema aplicado com sucesso!');
        }
        else {
            console.log('⚠️  Arquivo schema.sql não encontrado, criando tabelas básicas...');
            // Fallback para tabelas básicas
            await (0, database_1.query)(`
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
        const indexesPath = path_1.default.join(__dirname, '../../database/indexes.sql');
        if (fs_1.default.existsSync(indexesPath)) {
            const indexesSQL = fs_1.default.readFileSync(indexesPath, 'utf8');
            await (0, database_1.query)(indexesSQL);
            console.log('✅ Índices criados com sucesso!');
        }
        console.log('🎉 Banco de dados Sapere configurado com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao criar tabelas:', error);
    }
};
if (require.main === module) {
    createTables().then(() => process.exit(0));
}
exports.default = createTables;
//# sourceMappingURL=migrate.js.map