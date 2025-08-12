import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

// Para desenvolvimento local, usar SQLite se PostgreSQL não estiver disponível
const usePostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL || process.env.DB_HOST;

let pool: Pool;
let sqliteDb: Database;

if (usePostgres) {
  // Configuração PostgreSQL para Railway ou produção
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

  pool = new Pool({
    ...databaseConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Inicializar SQLite para desenvolvimento local
async function initSqlite() {
  if (!usePostgres) {
    const dbPath = path.join(__dirname, '../../../sapere_dev.db');
    sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Criar tabelas básicas para desenvolvimento
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'therapist',
        status TEXT DEFAULT 'active',
        phone TEXT,
        cpf TEXT,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir usuários de teste
    await sqliteDb.run(
      'INSERT OR REPLACE INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)',
      ['admin@sapere.com.br', hashedPassword, 'Admin', 'admin', 'active']
    );
    
    await sqliteDb.run(
      'INSERT OR REPLACE INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)',
      ['dra.maria@sapere.com.br', hashedPassword, 'Dra. Maria', 'therapist', 'active']
    );

    console.log('✅ SQLite database initialized with test users');
  }
}

initSqlite().catch(console.error);

export const query = async (text: string, params?: any[]) => {
  if (usePostgres) {
    return pool.query(text, params);
  } else {
    // Aguardar inicialização do SQLite se necessário
    if (!sqliteDb) {
      await initSqlite();
    }
    
    // Converter query PostgreSQL para SQLite
    let sqliteText = text.replace(/\$(\d+)/g, '?');
    
    // Converter CURRENT_TIMESTAMP
    sqliteText = sqliteText.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");
    
    if (sqliteText.toLowerCase().includes('select')) {
      const result = await sqliteDb.all(sqliteText, params);
      return { rows: result, rowCount: result.length };
    } else if (sqliteText.toLowerCase().includes('insert') && sqliteText.toLowerCase().includes('returning')) {
      // Para INSERT com RETURNING, fazer em duas etapas
      const insertText = sqliteText.split(' RETURNING')[0];
      const info = await sqliteDb.run(insertText, params);
      
      // Buscar o registro inserido
      const selectResult = await sqliteDb.get('SELECT * FROM users WHERE id = ?', [info.lastID]);
      return { rows: [selectResult], rowCount: 1 };
    } else if (sqliteText.toLowerCase().includes('update') && sqliteText.toLowerCase().includes('returning')) {
      // Para UPDATE com RETURNING
      const updateText = sqliteText.split(' RETURNING')[0];
      await sqliteDb.run(updateText, params);
      
      // Buscar o registro atualizado (assumindo que o último parâmetro é o ID)
      const userId = params?.[params.length - 1];
      const selectResult = await sqliteDb.get('SELECT * FROM users WHERE id = ?', [userId]);
      return { rows: [selectResult], rowCount: 1 };
    } else {
      const info = await sqliteDb.run(sqliteText, params);
      return { rows: [], rowCount: info.changes || 0 };
    }
  }
};

export const getClient = () => {
  if (usePostgres) {
    return pool.connect();
  }
  return null;
};

export default usePostgres ? pool : sqliteDb;