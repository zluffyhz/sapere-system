#!/usr/bin/env node

/**
 * 🔄 Script de Migração SQLite → PostgreSQL
 * Migra dados do SQLite de desenvolvimento para PostgreSQL de produção
 */

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações
const SQLITE_PATH = path.join(__dirname, '../sapere_dev.db');
const POSTGRES_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('🔄 Iniciando migração SQLite → PostgreSQL...');

async function migrate() {
  let sqliteDb, pgPool;
  
  try {
    // Verificar se SQLite existe
    if (!fs.existsSync(SQLITE_PATH)) {
      console.log('❌ Arquivo SQLite não encontrado:', SQLITE_PATH);
      process.exit(1);
    }

    // Conectar SQLite
    console.log('📁 Conectando ao SQLite...');
    sqliteDb = new sqlite3.Database(SQLITE_PATH);
    
    // Conectar PostgreSQL
    console.log('🐘 Conectando ao PostgreSQL...');
    pgPool = new Pool(POSTGRES_CONFIG);
    await pgPool.query('SELECT NOW()'); // Teste de conexão
    
    console.log('✅ Conexões estabelecidas!');

    // Migrar dados das tabelas
    await migrateTable('users', sqliteDb, pgPool);
    await migrateTable('therapists', sqliteDb, pgPool);
    await migrateTable('patients', sqliteDb, pgPool);
    await migrateTable('appointments', sqliteDb, pgPool);
    await migrateTable('records', sqliteDb, pgPool);
    await migrateTable('communications', sqliteDb, pgPool);
    await migrateTable('anamneses', sqliteDb, pgPool);

    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  } finally {
    if (sqliteDb) sqliteDb.close();
    if (pgPool) await pgPool.end();
  }
}

async function migrateTable(tableName, sqliteDb, pgPool) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Migrando tabela: ${tableName}`);
    
    // Buscar dados do SQLite
    sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
      if (err) {
        if (err.message.includes('no such table')) {
          console.log(`⚠️  Tabela ${tableName} não existe no SQLite, pulando...`);
          resolve();
          return;
        }
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log(`📋 Tabela ${tableName}: 0 registros`);
        resolve();
        return;
      }

      try {
        // Limpar tabela PostgreSQL
        await pgPool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        
        // Inserir dados
        for (const row of rows) {
          await insertRow(tableName, row, pgPool);
        }
        
        console.log(`✅ Tabela ${tableName}: ${rows.length} registros migrados`);
        resolve();
      } catch (error) {
        console.error(`❌ Erro ao migrar ${tableName}:`, error);
        reject(error);
      }
    });
  });
}

async function insertRow(tableName, row, pgPool) {
  const columns = Object.keys(row);
  const values = Object.values(row);
  
  // Tratar campos especiais
  const processedValues = values.map(value => {
    if (value === null || value === undefined) return null;
    
    // Converter arrays JSON do SQLite
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    
    return value;
  });

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')}) 
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING
  `;

  await pgPool.query(query, processedValues);
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };