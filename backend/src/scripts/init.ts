// Script de inicialização para Railway
// Executa migrations e seeds automaticamente na primeira execução

import { query } from '../database/config/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    console.log('🚀 Iniciando setup do banco de dados...');

    // Verificar se as tabelas já existem
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tablesCheck.rows.length > 0) {
      console.log('✅ Banco de dados já está configurado!');
      return;
    }

    console.log('📋 Executando migrations...');

    // Executar schema principal
    const schemaPath = path.join(__dirname, '../../database');
    const schemaFiles = ['schema.sql', 'indexes.sql', 'seeds.sql'];

    for (const file of schemaFiles) {
      const filePath = path.join(schemaPath, file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        if (sql.trim()) {
          await query(sql);
          console.log(`✅ ${file} executado com sucesso`);
        }
      }
    }

    console.log('🎉 Setup do banco de dados concluído!');
  } catch (error) {
    console.error('❌ Erro no setup do banco:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigrations };