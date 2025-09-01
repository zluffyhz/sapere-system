#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar schema SQL compatível
const schemaPath = path.join(__dirname, 'schema-compatible.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

// Configuração do banco (adapta para Railway ou local)
const databaseConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sapere_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };

const pool = new Pool(databaseConfig);

async function initDatabase() {
  console.log('🚀 Inicializando banco de dados...');
  
  try {
    // Testar conexão
    console.log('📡 Testando conexão...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Executar schema
    console.log('📋 Criando tabelas...');
    await client.query(schemaSQL);
    console.log('✅ Schema aplicado com sucesso!');
    
    // Verificar tabelas criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    
    console.log('🎉 Database inicializado com sucesso!');
    console.log('💡 Agora você pode iniciar o servidor com: npm start');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    console.error('💡 Verifique se:');
    console.error('   - O PostgreSQL está rodando');
    console.error('   - As credenciais estão corretas no .env');
    console.error('   - A DATABASE_URL está configurada corretamente');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };