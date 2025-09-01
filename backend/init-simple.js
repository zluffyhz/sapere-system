const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema-simple.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

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

const pool = new Pool({
  ...databaseConfig,
  max: 3,
  connectionTimeoutMillis: 5000,
});

async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    console.log('Creating tables...');
    await client.query(schemaSQL);
    console.log('Schema applied successfully');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    console.log('Database initialized successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };